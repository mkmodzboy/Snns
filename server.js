const express = require("express");
const http = require("http");
require("dotenv").config();
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs");

const {
    useMultiFileAuthState,
    makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} = require("@whiskeysockets/baileys");

const P = require("pino");

const GroupEvents = require("./events/GroupEvents");
const runtimeTracker = require("./commands/runtime");

const {
    setAntiDel,
    isAntiDel,
    storeMessage,
    recoverDeleted
} = require("./antidelSystem");

// ============================================================
// SERVER / HTTP / SOCKET.IO
// ============================================================

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// RUNTIME STORES
// ============================================================

const activeConnections = new Map();
const pairingCodes = new Map();
const userPrefixes = new Map();
const statusMediaStore = new Map();

let activeSockets = 0;
let totalUsers = 0;
let isUserLoggedIn = false;

const DATA_FILE = path.join(__dirname, "persistent-data.json");
const SESSIONS_DIR = path.join(__dirname, "sessions");
const COMMANDS_DIR = path.join(__dirname, "commands");

// ============================================================
// BOT CONFIGURATION
// ============================================================

const PREFIX = process.env.PREFIX || ".";
const BOT_NAME = process.env.BOT_NAME || "The TechX";
const OWNER_NAME = process.env.OWNER_NAME || "SILVER xZAMAN";
const DEV = process.env.DEV || "SILVERxZAMAN";
const REPO_LINK = process.env.REPO_LINK || "https://github.com";
const MENU_IMAGE_URL = process.env.MENU_IMAGE_URL ||
    "https://up6.cc/2026/04/177631893622821.jpg";

const AUTO_STATUS_SEEN = String(
    process.env.AUTO_STATUS_SEEN ?? "true"
).toLowerCase();

const AUTO_STATUS_REACT = String(
    process.env.AUTO_STATUS_REACT ?? "true"
).toLowerCase();

const AUTO_STATUS_REPLY = String(
    process.env.AUTO_STATUS_REPLY ?? "false"
).toLowerCase();

const AUTO_STATUS_MSG = process.env.AUTO_STATUS_MSG ||
    "YOUR STATUS HAS BEEN SEEN BY 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓🫶🏻";

const CHANNEL_JIDS = (
    process.env.CHANNEL_JIDS ||
    [
        "120363425629935700@newsletter",
        "120363425949353648@newsletter",
        "120363404748661765@newsletter",
        "120363408573182239@newsletter"
    ].join(",")
)
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

const NEWSLETTER_JIDS = [
    "120363420639555414@newsletter"
];

const REACTIONS = [
    "❤️",
    "🎀",
    "👍",
    "🫠",
    "🙏",
    "🫂",
    "✨",
    "🖤",
    "🥰",
    "🔥"
];

const STATUS_REACTIONS = [
    "❤️",
    "💸",
    "😇",
    "🍂",
    "💥",
    "💯",
    "🔥",
    "💫",
    "💎",
    "💗",
    "🤍",
    "🖤",
    "👀",
    "🙌",
    "🙆",
    "🚩",
    "🥰",
    "💐",
    "😎",
    "🤎",
    "✅",
    "🫀",
    "🧡",
    "😁",
    "😄",
    "🌸",
    "🕊️",
    "🌷",
    "⛅",
    "🌟",
    "🗿",
    "🇳🇬",
    "💜",
    "💙",
    "🌝",
    "💚"
];

// ============================================================
// PERSISTENT USER DATA
// ============================================================

function loadPersistentData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            savePersistentData();
            return;
        }

        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const data = JSON.parse(raw);

        totalUsers = Number(data.totalUsers) || 0;

        console.log(
            `📊 Loaded persistent data: ${totalUsers} total users`
        );
    } catch (error) {
        console.error(
            "❌ Error loading persistent data:",
            error.message
        );
        totalUsers = 0;
    }
}

function savePersistentData() {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                {
                    totalUsers,
                    lastUpdated: new Date().toISOString()
                },
                null,
                2
            )
        );
    } catch (error) {
        console.error(
            "❌ Error saving persistent data:",
            error.message
        );
    }
}

loadPersistentData();

setInterval(() => {
    savePersistentData();
}, 30000);

// ============================================================
// SOCKET.IO STATS
// ============================================================

function broadcastStats() {
    io.emit("statsUpdate", {
        activeSockets,
        totalUsers
    });
}

io.on("connection", socket => {
    console.log("📊 Frontend connected:", socket.id);

    socket.emit("statsUpdate", {
        activeSockets,
        totalUsers
    });

    socket.on("force-request-qr", () => {
        console.log("📱 QR/pairing regeneration requested");
    });

    socket.on("disconnect", () => {
        console.log("📊 Frontend disconnected:", socket.id);
    });
});

// ============================================================
// COMMAND LOADER
// ============================================================

const commands = new Map();

function normalizeCommandName(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/^\./, "");
}

function registerCommand(command, fileName) {
    if (!command) return;

    if (
        typeof command !== "object" ||
        typeof command.execute !== "function" ||
        !command.pattern
    ) {
        return;
    }

    const pattern = normalizeCommandName(command.pattern);

    commands.set(pattern, command);

    console.log(
        `✅ Loaded command: .${pattern} (${fileName})`
    );

    if (Array.isArray(command.alias)) {
        for (const alias of command.alias) {
            const aliasName = normalizeCommandName(alias);

            if (!aliasName) continue;

            commands.set(aliasName, command);

            console.log(
                `↳ Loaded alias: .${aliasName} -> .${pattern}`
            );
        }
    }
}

function loadCommands() {
    commands.clear();

    try {
        if (!fs.existsSync(COMMANDS_DIR)) {
            fs.mkdirSync(COMMANDS_DIR, {
                recursive: true
            });

            console.log(
                `📂 Created commands directory: ${COMMANDS_DIR}`
            );
        }

        const commandFiles = fs
            .readdirSync(COMMANDS_DIR)
            .filter(file => {
                return (
                    file.endsWith(".js") &&
                    !file.startsWith(".") &&
                    file !== "runtime.js"
                );
            });

        console.log(
            `📂 Loading commands from ${commandFiles.length} files...`
        );

        for (const file of commandFiles) {
            try {
                const filePath = path.join(
                    COMMANDS_DIR,
                    file
                );

                try {
                    delete require.cache[
                        require.resolve(filePath)
                    ];
                } catch (_) {}

                const commandModule = require(filePath);

                if (
                    commandModule &&
                    commandModule.pattern &&
                    typeof commandModule.execute === "function"
                ) {
                    registerCommand(
                        commandModule,
                        file
                    );
                    continue;
                }

                if (
                    commandModule &&
                    typeof commandModule === "object"
                ) {
                    for (const commandData of Object.values(
                        commandModule
                    )) {
                        registerCommand(
                            commandData,
                            file
                        );
                    }
                }
            } catch (error) {
                console.error(
                    `❌ Error loading command ${file}:`,
                    error.message
                );
            }
        }

        try {
            const runtimeCommand =
                runtimeTracker?.getRuntimeCommand?.();

            registerCommand(
                runtimeCommand,
                "runtime"
            );
        } catch (error) {
            console.error(
                "❌ Runtime command error:",
                error.message
            );
        }

        console.log(
            `📦 Total loaded commands: ${commands.size}`
        );
    } catch (error) {
        console.error(
            "❌ Command loader error:",
            error.message
        );
    }
}

loadCommands();

if (fs.existsSync(COMMANDS_DIR)) {
    fs.watch(
        COMMANDS_DIR,
        (eventType, filename) => {
            if (!filename) return;

            if (!filename.endsWith(".js")) {
                return;
            }

            console.log(
                `🔄 Command change detected: ${filename}`
            );

            setTimeout(() => {
                loadCommands();
            }, 250);
        }
    );
}

// ============================================================
// MESSAGE HELPERS
// ============================================================

function unwrapMessage(message) {
    if (!message) return null;

    if (message.ephemeralMessage?.message) {
        return unwrapMessage(
            message.ephemeralMessage.message
        );
    }

    if (message.viewOnceMessage?.message) {
        return unwrapMessage(
            message.viewOnceMessage.message
        );
    }

    if (message.viewOnceMessageV2?.message) {
        return unwrapMessage(
            message.viewOnceMessageV2.message
        );
    }

    if (
        message.viewOnceMessageV2Extension?.message
    ) {
        return unwrapMessage(
            message.viewOnceMessageV2Extension.message
        );
    }

    return message;
}

function getMessageType(message) {
    const data = unwrapMessage(
        message?.message || message
    );

    if (!data) return "UNKNOWN";

    const types = [
        "conversation",
        "extendedTextMessage",
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "documentMessage",
        "stickerMessage",
        "contactMessage",
        "locationMessage"
    ];

    for (const type of types) {
        if (data[type]) {
            return type;
        }
    }

    for (const key of Object.keys(data)) {
        if (key.endsWith("Message")) {
            return key;
        }
    }

    return "UNKNOWN";
}

function getMessageText(message) {
    const data = unwrapMessage(
        message?.message || message
    );

    const type = getMessageType(message);

    if (!data) return "";

    switch (type) {
        case "conversation":
            return data.conversation || "";

        case "extendedTextMessage":
            return data.extendedTextMessage?.text || "";

        case "imageMessage":
            return data.imageMessage?.caption || "";

        case "videoMessage":
            return data.videoMessage?.caption || "";

        case "documentMessage":
            return data.documentMessage?.caption || "";

        default:
            return "";
    }
}

function getQuotedMessage(message) {
    const root = message?.message || {};

    const context =
        root.extendedTextMessage?.contextInfo ||
        root.imageMessage?.contextInfo ||
        root.videoMessage?.contextInfo ||
        root.documentMessage?.contextInfo ||
        root.audioMessage?.contextInfo;

    if (!context?.quotedMessage) {
        return null;
    }

    return {
        message: {
            key: {
                remoteJid:
                    message.key.remoteJid,
                id: context.stanzaId,
                fromMe: false,
                participant:
                    context.participant
            },
            message: context.quotedMessage,
            mtype:
                Object.keys(
                    context.quotedMessage
                )[0] || "text"
        },
        sender: context.participant
    };
}

function getSenderJid(message) {
    return (
        message?.key?.participant ||
        message?.key?.remoteJid ||
        ""
    );
}

function isGroupJid(jid) {
    return String(jid || "").endsWith("@g.us");
}

function isPrivateJid(jid) {
    return String(jid || "").endsWith(
        "@s.whatsapp.net"
    );
}

function isNewsletterJid(jid) {
    return String(jid || "").endsWith(
        "@newsletter"
    );
}

function randomItem(array) {
    return array[
        Math.floor(Math.random() * array.length)
    ];
}

// ============================================================
// IMPORTANT ANTI-DELETE PROTOCOL EXTRACTION
// ============================================================
// Baileys can deliver revoke/delete events in different shapes.
// The old code only checked update.message.protocolMessage.
// In messages.update the revoke is commonly inside:
//     update.update.message.protocolMessage
// This helper checks all common wrappers so anti-delete does not
// silently miss the delete event.
// ============================================================

function findProtocolMessage(event) {
    if (!event) return null;

    const candidates = [
        event?.update?.message,
        event?.message,
        event?.update,
        event
    ];

    for (const candidate of candidates) {
        const message = unwrapMessage(candidate);

        if (message?.protocolMessage) {
            return message.protocolMessage;
        }
    }

    return null;
}

function isDeleteProtocol(protocol) {
    return Boolean(
        protocol?.key?.id
    );
}

function buildDeleteEvent(update, protocol) {
    return {
        key: update?.key || protocol?.key || {},
        message: {
            protocolMessage: protocol
        }
    };
}

// ============================================================
// BUILT-IN ANTI-DELETE COMMAND
// ============================================================

async function antiDeleteCommand(
    conn,
    message,
    commandName,
    args
) {
    const names = [
        "antidelete",
        "antidel",
        "anti-delete"
    ];

    if (!names.includes(commandName)) {
        return false;
    }

    const chatId =
        message?.key?.remoteJid ||
        message?.key?.remoteJidAlt ||
        "";

    if (!chatId) {
        console.error("❌ Anti-delete: remoteJid missing");
        return true;
    }

    // Try a quoted reply first, then retry without quoting. This is
    // important for WhatsApp self-chat on some Baileys builds.
    const sendAntiDeleteReply = async (payload) => {
        try {
            return await conn.sendMessage(
                chatId,
                payload,
                { quoted: message }
            );
        } catch (quotedError) {
            console.error(
                "⚠️ Anti-delete quoted reply failed:",
                quotedError.message
            );
            return await conn.sendMessage(
                chatId,
                payload
            );
        }
    };

    const value = String(
        args?.[0] || ""
    ).trim().toLowerCase();

    if (!value || !["on", "off"].includes(value)) {
        await sendAntiDeleteReply({
            text:
                `🛡️ *ANTI-DELETE*\n\n` +
                `Status: *${
                    isAntiDel(chatId)
                        ? "ON ✅"
                        : "OFF ❌"
                }*\n\n` +
                `Use .antidelete on\n` +
                `Use .antidelete off`
        });

        return true;
    }

    const enabled = value === "on";

    try {
        setAntiDel(
            chatId,
            enabled
        );
    } catch (error) {
        console.error(
            "❌ Anti-delete setting error:",
            error.message
        );

        await sendAntiDeleteReply({
            text:
                `❌ Anti-Delete setting failed: ${error.message}`
        });

        return true;
    }

    const savedState = isAntiDel(chatId);

    console.log(
        `🛡️ Anti-delete state for ${chatId}: ${
            savedState ? "ON" : "OFF"
        }`
    );

    if (enabled && savedState) {
        await sendAntiDeleteReply({
            text:
                `🛡️ *ANTI-DELETE ENABLED* ✅\n\n` +
                `Deleted messages will be recovered in this chat.`
        });
    } else if (!enabled && !savedState) {
        await sendAntiDeleteReply({
            text:
                `🛡️ *ANTI-DELETE DISABLED* ❌`
        });
    } else {
        await sendAntiDeleteReply({
            text:
                `❌ Anti-Delete could not be changed. Check server logs.`
        });
    }

    return true;
}

// ============================================================
// MENU
// ============================================================

function generateMenu(prefix) {
    const builtInCommands = [
        {
            name: "ping",
            tags: ["utility"]
        },
        {
            name: "speed",
            tags: ["utility"]
        },
        {
            name: "prefix",
            tags: ["settings"]
        },
        {
            name: "menu",
            tags: ["utility"]
        },
        {
            name: "menu1",
            tags: ["utility"]
        },
        {
            name: "antidelete",
            tags: ["security"]
        }
    ];

    const folderCommands = [];

    for (const [pattern, command] of commands.entries()) {
        folderCommands.push({
            name: pattern,
            tags:
                Array.isArray(command?.tags) &&
                command.tags.length
                    ? command.tags
                    : ["general"]
        });
    }

    const allCommands = [
        ...builtInCommands,
        ...folderCommands
    ];

    const commandsByTag = {};

    for (const command of allCommands) {
        for (const tag of command.tags) {
            if (!commandsByTag[tag]) {
                commandsByTag[tag] = [];
            }

            commandsByTag[tag].push(command);
        }
    }

    let menuText =
        `🚀 ${BOT_NAME} 🚀\n\n` +
        `📌 Prefix : ${prefix}\n` +
        `👤 Owner  : ${OWNER_NAME}\n` +
        `🔧 Total  : ${allCommands.length} commands\n\n` +
        `📋 MENU LIST\n` +
        `───────────────────\n`;

    for (const [tag, list] of Object.entries(
        commandsByTag
    )) {
        menuText +=
            `\n🔹 ${tag.toUpperCase()}:\n`;

        for (const command of list) {
            menuText +=
                `   ➤ ${prefix}${command.name}\n`;
        }
    }

    return menuText;
}

// ============================================================
// CHANNEL SUBSCRIPTION
// ============================================================

async function subscribeToChannels(conn) {
    const results = [];

    for (const channelJid of CHANNEL_JIDS) {
        try {
            let method = "unknown";
            let result = null;

            if (
                typeof conn.newsletterFollow ===
                "function"
            ) {
                method = "newsletterFollow";
                result = await conn.newsletterFollow(
                    channelJid
                );
            } else if (
                typeof conn.followNewsletter ===
                "function"
            ) {
                method = "followNewsletter";
                result = await conn.followNewsletter(
                    channelJid
                );
            } else if (
                typeof conn.subscribeToNewsletter ===
                "function"
            ) {
                method = "subscribeToNewsletter";
                result = await conn.subscribeToNewsletter(
                    channelJid
                );
            } else {
                method = "presence-fallback";

                await conn.sendPresenceUpdate(
                    "available",
                    channelJid
                );
            }

            console.log(
                `📢 Channel OK: ${channelJid} (${method})`
            );

            results.push({
                success: true,
                channel: channelJid,
                method,
                result
            });
        } catch (error) {
            console.error(
                `❌ Channel failed: ${channelJid}:`,
                error.message
            );

            results.push({
                success: false,
                channel: channelJid,
                error: error.message
            });
        }

        await new Promise(resolve =>
            setTimeout(resolve, 700)
        );
    }

    return results;
}

// ============================================================
// BUILT-IN COMMANDS
// ============================================================

async function handleBuiltInCommands(
    conn,
    message,
    commandName,
    args,
    sessionId
) {
    try {
        if (
            await antiDeleteCommand(
                conn,
                message,
                commandName,
                args
            )
        ) {
            return true;
        }

        const from =
            message?.key?.remoteJid;

        const prefix =
            userPrefixes.get(sessionId) ||
            PREFIX;

        if (!from) {
            return true;
        }

        // ----------------------------------------------------
        // NEWSLETTER / CHANNEL COMMANDS
        // ----------------------------------------------------

        if (isNewsletterJid(from)) {
            if (commandName === "ping" || commandName === "speed") {
                const start = Date.now();

                const details =
                    `⚡ *${BOT_NAME} SPEED CHECK* ⚡\n\n` +
                    `⏱️ Response Time: *${(
                        (Date.now() - start) /
                        1000
                    ).toFixed(2)}s* ⚡\n` +
                    `👤 Owner: *${OWNER_NAME}*`;

                try {
                    if (
                        typeof conn.newsletterSend ===
                        "function"
                    ) {
                        await conn.newsletterSend(
                            from,
                            { text: details }
                        );
                    } else {
                        await conn.sendMessage(
                            from,
                            { text: details }
                        );
                    }
                } catch (error) {
                    console.error(
                        "❌ Newsletter ping error:",
                        error.message
                    );
                }

                return true;
            }

            if (
                commandName === "menu" ||
                commandName === "menu1"
            ) {
                const menu = generateMenu(prefix);

                try {
                    if (
                        typeof conn.newsletterSend ===
                        "function"
                    ) {
                        await conn.newsletterSend(
                            from,
                            { text: menu }
                        );
                    } else {
                        await conn.sendMessage(
                            from,
                            { text: menu }
                        );
                    }
                } catch (error) {
                    console.error(
                        "❌ Newsletter menu error:",
                        error.message
                    );
                }

                return true;
            }

            return false;
        }

        // ----------------------------------------------------
        // PING / SPEED
        // ----------------------------------------------------

        if (
            commandName === "ping" ||
            commandName === "speed"
        ) {
            const start = Date.now();

            await conn.sendMessage(
                from,
                {
                    text:
                        "🏓 Pong! Checking speed..."
                },
                { quoted: message }
            );

            const responseTime =
                (Date.now() - start) /
                1000;

            const reactionEmoji = randomItem([
                "🔥",
                "⚡",
                "🚀",
                "💨",
                "🎯",
                "🎉",
                "🌟",
                "💥",
                "🕐",
                "🔹"
            ]);

            const textEmoji = randomItem([
                "💎",
                "🏆",
                "⚡️",
                "🚀",
                "🎶",
                "🌠",
                "🌀",
                "🔱",
                "🛡️",
                "✨"
            ]);

            try {
                await conn.sendMessage(from, {
                    react: {
                        text: textEmoji,
                        key: message.key
                    }
                });
            } catch (error) {
                console.error(
                    "❌ Ping reaction error:",
                    error.message
                );
            }

            const details =
                `⚡ *${BOT_NAME} SPEED CHECK* ⚡\n\n` +
                `⏱️ Response Time: *${responseTime.toFixed(2)}s* ${reactionEmoji}\n` +
                `👤 Owner: *${OWNER_NAME}*`;

            await conn.sendMessage(
                from,
                {
                    text: details,
                    contextInfo: {
                        externalAdReply: {
                            title:
                                "⚡ 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 Speed Test",
                            body:
                                `${BOT_NAME} Performance Check`,
                            thumbnailUrl:
                                MENU_IMAGE_URL,
                            mediaType: 1,
                            renderLargerThumbnail:
                                true
                        }
                    }
                },
                { quoted: message }
            );

            return true;
        }

        // ----------------------------------------------------
        // PREFIX
        // ----------------------------------------------------

        if (commandName === "prefix") {
            const currentPrefix =
                userPrefixes.get(sessionId) ||
                PREFIX;

            await conn.sendMessage(
                from,
                {
                    text:
                        `📌 Current prefix: ${currentPrefix}`
                },
                { quoted: message }
            );

            return true;
        }

        // ----------------------------------------------------
        // MENU
        // ----------------------------------------------------

        if (
            commandName === "menu" ||
            commandName === "menu1"
        ) {
            const menu = generateMenu(prefix);

            await conn.sendMessage(
                from,
                {
                    text: menu,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid:
                                "120363425629935700@newsletter",
                            newsletterName:
                                "𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓",
                            serverMessageId: 200
                        },
                        externalAdReply: {
                            title:
                                "📃 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 Command Menu",
                            body:
                                `${BOT_NAME} - All Available Commands`,
                            thumbnailUrl:
                                MENU_IMAGE_URL,
                            mediaType: 1,
                            renderLargerThumbnail:
                                true
                        }
                    }
                },
                { quoted: message }
            );

            return true;
        }

        return false;
    } catch (error) {
        console.error(
            "❌ Built-in command error:",
            error.message
        );

        return true;
    }
}

// ============================================================
// COMMAND PROCESSING
// ============================================================

async function handleMessage(
    conn,
    message,
    sessionId
) {
    try {
        if (!message?.key) {
            return;
        }

        const remoteJid =
            message.key.remoteJid;

        if (!remoteJid) {
            return;
        }

        // ----------------------------------------------------
        // STATUS HANDLING
        // ----------------------------------------------------

        if (
            remoteJid === "status@broadcast"
        ) {
            if (
                AUTO_STATUS_SEEN === "true"
            ) {
                await conn
                    .readMessages([message.key])
                    .catch(error => {
                        console.error(
                            "❌ Status seen error:",
                            error.message
                        );
                    });
            }

            if (
                AUTO_STATUS_REACT === "true" &&
                !message.key.fromMe
            ) {
                try {
                    const emoji =
                        randomItem(
                            STATUS_REACTIONS
                        );

                    const statusJidList = [
                        message.key.participant,
                        conn.user?.id
                    ].filter(Boolean);

                    await conn.sendMessage(
                        "status@broadcast",
                        {
                            react: {
                                text: emoji,
                                key: message.key
                            }
                        },
                        { statusJidList }
                    );

                    console.log(
                        `✅ Auto-liked status with ${emoji}`
                    );
                } catch (error) {
                    console.error(
                        "❌ Status reaction error:",
                        error.message
                    );
                }
            }

            if (
                AUTO_STATUS_REPLY === "true" &&
                message.key.participant
            ) {
                try {
                    await conn.sendMessage(
                        message.key.participant,
                        {
                            text: AUTO_STATUS_MSG,
                            react: {
                                text: "💜",
                                key: message.key
                            }
                        },
                        { quoted: message }
                    );
                } catch (error) {
                    console.error(
                        "❌ Status reply error:",
                        error.message
                    );
                }
            }

            if (
                message.message?.imageMessage ||
                message.message?.videoMessage
            ) {
                statusMediaStore.set(
                    message.key.participant,
                    {
                        message,
                        timestamp: Date.now()
                    }
                );
            }

            return;
        }

        if (!message.message) {
            return;
        }

        const body = getMessageText(message);

        if (!body) {
            return;
        }

        const prefix =
            userPrefixes.get(sessionId) ||
            PREFIX;

        if (!body.startsWith(prefix)) {
            return;
        }

        const raw = body
            .slice(prefix.length)
            .trim();

        if (!raw) {
            return;
        }

        const parts = raw.split(/\s+/);
        const commandName = normalizeCommandName(
            parts.shift()
        );
        const args = parts;

        console.log(
            `🔍 Detected command: .${commandName} from ${sessionId}`
        );

        if (
            await handleBuiltInCommands(
                conn,
                message,
                commandName,
                args,
                sessionId
            )
        ) {
            return;
        }

        const command = commands.get(
            commandName
        );

        if (!command) {
            console.log(
                `⚠️ Command not found: .${commandName}`
            );
            return;
        }

        const from =
            message.key.remoteJid;

        const sender = getSenderJid(
            message
        );

        const isGroup =
            isGroupJid(from);

        let groupMetadata = null;

        if (isGroup) {
            try {
                groupMetadata =
                    await conn.groupMetadata(
                        from
                    );
            } catch (error) {
                console.error(
                    "❌ Group metadata error:",
                    error.message
                );
            }
        }

        const participant =
            groupMetadata?.participants?.find(
                item =>
                    item.id === sender ||
                    item.jid === sender
            );

        const isAdmins =
            participant?.admin === "admin" ||
            participant?.admin === "superadmin";

        const isCreator =
            participant?.admin ===
            "superadmin";

        const quoted =
            getQuotedMessage(message);

        const mentionedJid =
            message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.mentionedJid || [];

        const q = raw
            .slice(commandName.length)
            .trim();

        const reply = (
            text,
            options = {}
        ) => {
            return conn.sendMessage(
                from,
                {
                    text,
                    ...options
                },
                {
                    quoted: message
                }
            );
        };

        const commandMessage = {
            mentionedJid,
            quoted,
            sender,
            chat: from,
            fromMe: Boolean(
                message.key.fromMe
            )
        };

        const commandContext = {
            args,
            q,
            reply,
            from,
            isGroup,
            groupMetadata,
            sender,
            isAdmins,
            isCreator,
            prefix,
            command: commandName,
            sessionId,
            botName: BOT_NAME,
            ownerName: OWNER_NAME,
            dev: DEV,
            repo: REPO_LINK
        };

        console.log(
            `🔧 Executing .${commandName}`
        );

        await command.execute(
            conn,
            message,
            commandMessage,
            commandContext
        );
    } catch (error) {
        console.error(
            "❌ Error handling message:",
            error
        );
    }
}

// ============================================================
// ANTI-DELETE EVENT PIPELINE
// ============================================================
// IMPORTANT:
// 1. Store normal messages BEFORE they can be deleted.
// 2. Detect delete protocol from both messages.upsert and
//    messages.update.
// 3. For messages.update, check update.update.message.
// 4. Never register this listener inside command execution.
// ============================================================

async function interceptAntiDeleteCommand(conn, message, sessionId) {
    try {
        if (!message?.key || !message?.message) return false;

        const body = getMessageText(message);
        if (!body) return false;

        const prefix = userPrefixes.get(sessionId) || PREFIX;
        if (!body.startsWith(prefix)) return false;

        const raw = body.slice(prefix.length).trim();
        if (!raw) return false;

        const parts = raw.split(/\s+/);
        const commandName = normalizeCommandName(parts.shift());
        const args = parts;

        if (!['antidelete', 'antidel', 'anti-delete'].includes(commandName)) {
            return false;
        }

        console.log(`🛡️ Anti-delete command intercepted: .${commandName} ${args.join(' ')}`);
        await antiDeleteCommand(conn, message, commandName, args);
        return true;
    } catch (error) {
        console.error('❌ Anti-delete command interception error:', error.message);
        return false;
    }
}

async function processMessageUpsert(
    conn,
    upsert,
    sessionId
) {
    const messages =
        upsert?.messages || [];

    for (const message of messages) {
        if (!message?.key) {
            continue;
        }

        const protocol =
            findProtocolMessage(message);

        if (isDeleteProtocol(protocol)) {
            console.log(
                `🗑️ Delete protocol received via upsert: ${protocol.key.id}`
            );

            try {
                await recoverDeleted(
                    conn,
                    buildDeleteEvent(
                        message,
                        protocol
                    )
                );
            } catch (error) {
                console.error(
                    "❌ Anti-delete upsert recovery error:",
                    error.message
                );
            }

            continue;
        }

        // Store the original message immediately.
        if (message.message) {
            try {
                await storeMessage(
                    conn,
                    message
                );
            } catch (error) {
                console.error(
                    "❌ Anti-delete store error:",
                    error.message
                );
            }
        }

        // Anti-delete command gets a dedicated early path.
        // This makes .antidelete on/off work reliably even for
        // self-chat/fromMe messages and avoids depending on any
        // other command-routing branch.
        if (await interceptAntiDeleteCommand(conn, message, sessionId)) {
            continue;
        }

        // Normal command/message processing.
        try {
            const from =
                message.key.remoteJid;

            const botJid =
                conn.user?.id || "";

            const normalizedBotJid =
                botJid.includes(":")
                    ? `${botJid.split(":")[0]}@s.whatsapp.net`
                    : botJid;

            const sender =
                message.key.participant ||
                message.key.remoteJid;

            const isFromBot =
                Boolean(message.key.fromMe) ||
                sender === normalizedBotJid ||
                from === normalizedBotJid;

            // Keep the same self-message behavior while
            // allowing owner commands sent from the bot account.
            if (
                message.key.fromMe &&
                !isFromBot
            ) {
                continue;
            }

            if (
                isNewsletterJid(from) ||
                isGroupJid(from) ||
                isPrivateJid(from) ||
                isFromBot
            ) {
                await handleMessage(
                    conn,
                    message,
                    sessionId
                );
            }

            const type =
                getMessageType(message);
            const text =
                getMessageText(message);

            const timestamp =
                message.messageTimestamp
                    ? new Date(
                        Number(
                            message.messageTimestamp
                        ) * 1000
                    ).toLocaleTimeString()
                    : new Date().toLocaleTimeString();

            if (
                !message.key.fromMe ||
                isFromBot
            ) {
                console.log(
                    `[${timestamp}] ${from} | ${sender} | ${text || `[${type}]`}`
                );
            }
        } catch (error) {
            console.error(
                "❌ Message processing error:",
                error.message
            );
        }
    }
}

function setupAntiDelete(conn) {
    // --------------------------------------------------------
    // PRIMARY DELETE EVENT
    // --------------------------------------------------------
    conn.ev.on(
        "messages.update",
        async updates => {
            for (const update of updates || []) {
                try {
                    const protocol =
                        findProtocolMessage(update);

                    if (
                        !isDeleteProtocol(
                            protocol
                        )
                    ) {
                        continue;
                    }

                    console.log(
                        `🗑️ messages.update revoke received: ${protocol.key.id}`
                    );

                    await recoverDeleted(
                        conn,
                        buildDeleteEvent(
                            update,
                            protocol
                        )
                    );
                } catch (error) {
                    console.error(
                        "❌ Anti-delete messages.update error:",
                        error.message
                    );
                }
            }
        }
    );

    // --------------------------------------------------------
    // SECONDARY DELETE EVENT
    // --------------------------------------------------------
    // Some Baileys versions deliver revoke as a protocol message
    // through messages.upsert. The main upsert handler already
    // processes it, so no duplicate listener is necessary here.
    // --------------------------------------------------------
}

// ============================================================
// GROUP EVENTS
// ============================================================

function setupGroupEvents(conn) {
    if (typeof GroupEvents !== "function") {
        console.log(
            "⚠️ GroupEvents is not a function; skipped."
        );
        return;
    }

    conn.ev.on(
        "group-participants.update",
        async update => {
            try {
                console.log(
                    "🔥 group-participants.update fired"
                );

                await GroupEvents(
                    conn,
                    update
                );
            } catch (error) {
                console.error(
                    "❌ GroupEvents error:",
                    error.message
                );
            }
        }
    );
}

// ============================================================
// NEWSLETTER AUTO-REACTION
// ============================================================

function setupNewsletterAutoReact(conn) {
    conn.ev.on(
        "messages.upsert",
        async upsert => {
            try {
                for (const message of upsert?.messages || []) {
                    const chatId =
                        message?.key?.remoteJid;

                    if (!chatId) continue;

                    if (
                        !NEWSLETTER_JIDS.includes(
                            chatId
                        )
                    ) {
                        continue;
                    }

                    if (!message.message) {
                        continue;
                    }

                    if (message.key.fromMe) {
                        continue;
                    }

                    const reaction =
                        randomItem(REACTIONS);

                    await new Promise(resolve =>
                        setTimeout(
                            resolve,
                            1000 +
                                Math.random() * 2000
                        )
                    );

                    await conn.sendMessage(
                        chatId,
                        {
                            react: {
                                text: reaction,
                                key: message.key
                            }
                        }
                    );

                    console.log(
                        `✅ Newsletter auto-reacted ${reaction} -> ${chatId}`
                    );
                }
            } catch (error) {
                console.error(
                    "❌ Newsletter auto-react error:",
                    error.message
                );
            }
        }
    );
}

// ============================================================
// CONNECTION HANDLERS
// ============================================================

function getDisconnectCode(lastDisconnect) {
    return (
        lastDisconnect?.error?.output
            ?.statusCode ??
        lastDisconnect?.error
            ?.statusCode ??
        null
    );
}

function setupConnectionHandlers(
    conn,
    sessionId,
    saveCreds
) {
    conn.__sessionId = sessionId;

    let reconnectAttempts = 0;
    let countedAsActive = false;
    let loggedOut = false;

    const MAX_RECONNECT_ATTEMPTS = 10;

    conn.ev.on(
        "connection.update",
        async update => {
            const {
                connection,
                lastDisconnect
            } = update;

            console.log(
                `📡 Connection update [${sessionId}]: ${connection || "unknown"}`
            );

            if (connection === "open") {
                loggedOut = false;
                reconnectAttempts = 0;
                isUserLoggedIn = true;

                if (!countedAsActive) {
                    countedAsActive = true;
                    activeSockets++;
                }

                console.log(
                    `✅ WhatsApp connected: ${sessionId}`
                );

                console.log(
                    `🛡️ Anti-delete ready: ${sessionId}`
                );

                broadcastStats();

                io.emit("linked", {
                    sessionId
                });

                setTimeout(async () => {
                    try {
                        await subscribeToChannels(
                            conn
                        );
                    } catch (error) {
                        console.error(
                            "❌ Channel subscription error:",
                            error.message
                        );
                    }
                }, 2500);

                return;
            }

            if (connection !== "close") {
                return;
            }

            const code =
                getDisconnectCode(
                    lastDisconnect
                );

            const isLoggedOutReason =
                code ===
                DisconnectReason.loggedOut;

            if (countedAsActive) {
                countedAsActive = false;
                activeSockets = Math.max(
                    0,
                    activeSockets - 1
                );
                broadcastStats();
            }

            if (isLoggedOutReason) {
                loggedOut = true;
                isUserLoggedIn = false;

                console.log(
                    `🔒 WhatsApp logged out: ${sessionId}`
                );

                activeConnections.delete(
                    sessionId
                );

                io.emit("unlinked", {
                    sessionId
                });

                // Only a real loggedOut reason deletes the
                // session. Network errors never delete auth data.
                cleanupSession(
                    sessionId,
                    true
                );

                return;
            }

            if (
                activeConnections.has(sessionId) &&
                !loggedOut &&
                reconnectAttempts <
                    MAX_RECONNECT_ATTEMPTS
            ) {
                reconnectAttempts++;

                const delay = Math.min(
                    5000 * reconnectAttempts,
                    30000
                );

                console.log(
                    `🔁 Reconnecting ${sessionId} in ${delay}ms (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
                );

                setTimeout(() => {
                    if (
                        activeConnections.has(
                            sessionId
                        )
                    ) {
                        initializeConnection(
                            sessionId
                        ).catch(error => {
                            console.error(
                                `❌ Reconnect error ${sessionId}:`,
                                error.message
                            );
                        });
                    }
                }, delay);
            } else {
                console.log(
                    `⚠️ Reconnect limit reached for ${sessionId}; session preserved.`
                );
            }
        }
    );

    conn.ev.on(
        "creds.update",
        async () => {
            try {
                if (typeof saveCreds === "function") {
                    await saveCreds();
                }
            } catch (error) {
                console.error(
                    "❌ Credentials save error:",
                    error.message
                );
            }
        }
    );

    // One central messages.upsert listener handles normal
    // messages, anti-delete protocol messages, and commands.
    conn.ev.on(
        "messages.upsert",
        upsert => {
            return processMessageUpsert(
                conn,
                upsert,
                sessionId
            ).catch(error => {
                console.error(
                    "❌ messages.upsert error:",
                    error.message
                );
            });
        }
    );

    // Anti-delete listener is registered ONCE per socket.
    setupAntiDelete(conn);

    // Group listener is registered ONCE per socket.
    setupGroupEvents(conn);

    // Newsletter reaction is registered ONCE per socket.
    setupNewsletterAutoReact(conn);
}

// ============================================================
// CONNECTION CREATION
// ============================================================

async function createConnection(sessionId) {
    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, {
            recursive: true
        });
    }

    const sessionDir = path.join(
        SESSIONS_DIR,
        sessionId
    );

    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, {
            recursive: true
        });
    }

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        sessionDir
    );

    const {
        version
    } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({
            level: "silent"
        }),
        printQRInTerminal: false,
        auth: state,
        version,
        browser: Browsers.macOS(
            "Safari"
        ),
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        maxIdleTimeMs: 60000,
        maxRetries: 10,
        markOnlineOnConnect: true,
        emitOwnEvents: true,
        defaultQueryTimeoutMs: 60000,
        syncFullHistory: false,
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 3000
        }
    });

    activeConnections.set(
        sessionId,
        {
            conn,
            saveCreds,
            hasLinked:
                Boolean(
                    state.creds?.registered
                )
        }
    );

    setupConnectionHandlers(
        conn,
        sessionId,
        saveCreds
    );

    return {
        conn,
        state,
        saveCreds
    };
}

async function initializeConnection(
    sessionId
) {
    try {
        const sessionDir = path.join(
            SESSIONS_DIR,
            sessionId
        );

        if (
            !fs.existsSync(
                path.join(
                    sessionDir,
                    "creds.json"
                )
            )
        ) {
            console.log(
                `📁 No creds.json for session ${sessionId}; preserving folder.`
            );
            return null;
        }

        const old =
            activeConnections.get(
                sessionId
            );

        try {
            old?.conn?.ws?.close();
        } catch (_) {}

        const created =
            await createConnection(
                sessionId
            );

        console.log(
            `✅ Reloaded session: ${sessionId}`
        );

        return created.conn;
    } catch (error) {
        console.error(
            `❌ Error reinitializing ${sessionId}:`,
            error.message
        );

        return null;
    }
}

// ============================================================
// SESSION CLEANUP
// ============================================================

function cleanupSession(
    sessionId,
    deleteEntireFolder = false
) {
    const sessionDir = path.join(
        SESSIONS_DIR,
        sessionId
    );

    if (!fs.existsSync(sessionDir)) {
        return;
    }

    if (!deleteEntireFolder) {
        console.log(
            `📁 Session preserved: ${sessionId}`
        );
        return;
    }

    try {
        fs.rmSync(
            sessionDir,
            {
                recursive: true,
                force: true
            }
        );

        console.log(
            `🗑️ Deleted session after real logout: ${sessionId}`
        );
    } catch (error) {
        console.error(
            `❌ Session cleanup error ${sessionId}:`,
            error.message
        );
    }
}

// ============================================================
// HTTP ROUTES
// ============================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

app.get(
    "/api/commands",
    (req, res) => {
        res.json({
            success: true,
            commands:
                Array.from(
                    commands.keys()
                ).sort()
        });
    }
);

app.get(
    "/api/antidelete/:chatId",
    (req, res) => {
        try {
            const chatId = decodeURIComponent(
                req.params.chatId
            );

            res.json({
                success: true,
                chatId,
                enabled:
                    isAntiDel(chatId)
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

// ============================================================
// PAIRING API
// ============================================================

app.post(
    "/api/pair",
    async (req, res) => {
        let conn = null;

        try {
            const rawNumber = String(
                req.body?.number || ""
            );

            const number = rawNumber.replace(
                /\D/g,
                ""
            );

            if (!number) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Phone number is required"
                });
            }

            const sessionDir = path.join(
                SESSIONS_DIR,
                number
            );

            if (!fs.existsSync(sessionDir)) {
                fs.mkdirSync(sessionDir, {
                    recursive: true
                });
            }

            const hadCreds = fs.existsSync(
                path.join(
                    sessionDir,
                    "creds.json"
                )
            );

            const existing =
                activeConnections.get(
                    number
                );

            if (existing?.conn) {
                conn = existing.conn;
            } else {
                const created =
                    await createConnection(
                        number
                    );

                conn = created.conn;
            }

            // Give the socket enough time to reach the
            // state where pairing code can be requested.
            await new Promise(resolve =>
                setTimeout(resolve, 1500)
            );

            const pairingCode =
                await conn.requestPairingCode(
                    number
                );

            pairingCodes.set(
                number,
                {
                    code: pairingCode,
                    timestamp: Date.now()
                }
            );

            const connectionData =
                activeConnections.get(
                    number
                );

            if (
                !hadCreds &&
                connectionData &&
                !connectionData.hasLinked
            ) {
                connectionData.hasLinked =
                    true;

                totalUsers++;

                savePersistentData();
            }

            broadcastStats();

            return res.json({
                success: true,
                pairingCode,
                message:
                    "Pairing code generated successfully",
                isNewUser: !hadCreds
            });
        } catch (error) {
            console.error(
                "❌ Error generating pairing code:",
                error
            );

            try {
                conn?.ws?.close();
            } catch (_) {}

            return res.status(500).json({
                success: false,
                error:
                    "Failed to generate pairing code",
                details: error.message
            });
        }
    }
);

// ============================================================
// SESSION PRESERVATION LOGGING
// ============================================================

setInterval(() => {
    try {
        if (!fs.existsSync(SESSIONS_DIR)) {
            return;
        }

        const now = Date.now();
        const sessions = fs.readdirSync(
            SESSIONS_DIR
        );

        for (const sessionId of sessions) {
            const sessionPath = path.join(
                SESSIONS_DIR,
                sessionId
            );

            let stats;

            try {
                stats = fs.statSync(
                    sessionPath
                );
            } catch (_) {
                continue;
            }

            if (!stats.isDirectory()) {
                continue;
            }

            const age =
                now - stats.mtimeMs;

            if (
                age > 5 * 60 * 1000 &&
                !activeConnections.has(
                    sessionId
                )
            ) {
                console.log(
                    `📊 Session ${sessionId} is ${Math.round(age / 60000)} minutes old - PRESERVED`
                );
            }
        }
    } catch (error) {
        console.error(
            "❌ Session preservation logger error:",
            error.message
        );
    }
}, 5 * 60 * 1000);

// ============================================================
// RELOAD EXISTING SESSIONS
// ============================================================

async function reloadExistingSessions() {
    console.log(
        "🔄 Checking for existing sessions..."
    );

    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, {
            recursive: true
        });

        console.log(
            "📁 Sessions directory created."
        );

        return;
    }

    const sessions = fs
        .readdirSync(SESSIONS_DIR)
        .filter(sessionId => {
            try {
                return fs.statSync(
                    path.join(
                        SESSIONS_DIR,
                        sessionId
                    )
                ).isDirectory();
            } catch (_) {
                return false;
            }
        });

    console.log(
        `📂 Found ${sessions.length} session directories.`
    );

    for (const sessionId of sessions) {
        const credsPath = path.join(
            SESSIONS_DIR,
            sessionId,
            "creds.json"
        );

        if (!fs.existsSync(credsPath)) {
            console.log(
                `📁 ${sessionId}: no creds.json; folder preserved.`
            );
            continue;
        }

        try {
            await initializeConnection(
                sessionId
            );
        } catch (error) {
            console.error(
                `❌ Failed to reload ${sessionId}:`,
                error.message
            );
        }
    }

    broadcastStats();

    console.log(
        "✅ Session reload process completed."
    );
}

// ============================================================
// SERVER START
// ============================================================

server.listen(
    port,
    async () => {
        console.log(
            `🚀 ${BOT_NAME} server running on port ${port}`
        );

        console.log(
            `📱 WhatsApp bot initialized`
        );

        console.log(
            `🔧 Loaded ${commands.size} commands`
        );

        console.log(
            "🛡️ Built-in .antidelete command enabled"
        );

        console.log(
            "🛡️ Anti-delete protocol listener enabled"
        );

        await reloadExistingSessions();
    }
);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

let isShuttingDown = false;

async function gracefulShutdown() {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    console.log(
        "\n🛑 Shutting down The TechX server..."
    );

    savePersistentData();

    let closed = 0;

    for (const [sessionId, data] of activeConnections.entries()) {
        try {
            data?.conn?.ws?.close();
            closed++;

            console.log(
                `🔒 Closed WhatsApp connection: ${sessionId}`
            );
        } catch (error) {
            console.error(
                `⚠️ Could not close ${sessionId}:`,
                error.message
            );
        }
    }

    console.log(
        `✅ Closed ${closed} WhatsApp connections.`
    );

    console.log(
        "📁 Session folders preserved."
    );

    const timeout = setTimeout(() => {
        process.exit(0);
    }, 5000);

    server.close(() => {
        clearTimeout(timeout);
        process.exit(0);
    });
}

process.on(
    "SIGINT",
    () => {
        gracefulShutdown();
    }
);

process.on(
    "SIGTERM",
    () => {
        gracefulShutdown();
    }
);

process.on(
    "uncaughtException",
    error => {
        console.error(
            "❌ Uncaught Exception:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    (reason, promise) => {
        console.error(
            "❌ Unhandled Rejection:",
            reason,
            promise
        );
    }
);

// ============================================================
// END OF SERVER.JS
// ============================================================
