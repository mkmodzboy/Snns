const fs = require("fs");
const path = require("path");
const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

// ======================================================
// ANTI-DELETE PRO SYSTEM
// ======================================================

const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "antidel-settings.json");
const MEDIA_DIR = path.join(DATA_DIR, "antidel-media");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// RAM store
if (!global.antiDelStore) {
    global.antiDelStore = new Map();
}

// ------------------------------------------------------
// SETTINGS
// ------------------------------------------------------

function getSettings() {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) return {};

        return JSON.parse(
            fs.readFileSync(SETTINGS_FILE, "utf8")
        );
    } catch (e) {
        console.error("AntiDel settings error:", e.message);
        return {};
    }
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(
            SETTINGS_FILE,
            JSON.stringify(settings, null, 2)
        );
    } catch (e) {
        console.error("AntiDel save error:", e.message);
    }
}

function setAntiDel(chatId, value) {
    const settings = getSettings();

    settings[chatId] = Boolean(value);

    saveSettings(settings);
}

function isAntiDel(chatId) {
    const settings = getSettings();

    return settings[chatId] === true;
}

// ------------------------------------------------------
// MESSAGE UNWRAPPER
// ------------------------------------------------------

function unwrapMessage(message) {
    if (!message) return null;

    if (message.ephemeralMessage?.message) {
        return unwrapMessage(message.ephemeralMessage.message);
    }

    if (message.viewOnceMessage?.message) {
        return unwrapMessage(message.viewOnceMessage.message);
    }

    if (message.viewOnceMessageV2?.message) {
        return unwrapMessage(message.viewOnceMessageV2.message);
    }

    if (message.viewOnceMessageV2Extension?.message) {
        return unwrapMessage(message.viewOnceMessageV2Extension.message);
    }

    return message;
}

// ------------------------------------------------------
// MESSAGE TYPE
// ------------------------------------------------------

function getMessageType(message) {
    const msg = unwrapMessage(message);

    if (!msg) return null;

    const types = [
        "conversation",
        "extendedTextMessage",
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "stickerMessage",
        "documentMessage",
        "contactMessage",
        "locationMessage"
    ];

    for (const type of types) {
        if (msg[type]) return type;
    }

    return null;
}

// ------------------------------------------------------
// STORE MESSAGE
// ------------------------------------------------------

async function storeMessage(sock, msg) {
    try {
        if (!msg || !msg.key || !msg.message) return;

        // Protocol/delete messages ko save nahi karna
        if (msg.message.protocolMessage) return;

        const chatId = msg.key.remoteJid;

        if (!chatId) return;

        // Sirf us chat ke messages store karein jahan Anti-Delete ON hai
        if (!isAntiDel(chatId)) return;

        const message = unwrapMessage(msg.message);

        if (!message) return;

        const type = getMessageType(message);

        if (!type) return;

        const id = msg.key.id;

        if (!id) return;

        // Already saved
        if (global.antiDelStore.has(id)) return;

        const sender =
            msg.key.participant ||
            msg.key.remoteJid ||
            "unknown";

        const pushName =
            msg.pushName ||
            "Unknown User";

        // ------------------------------------------------
        // TEXT
        // ------------------------------------------------

        if (
            type === "conversation" ||
            type === "extendedTextMessage"
        ) {
            let text = "";

            if (type === "conversation") {
                text = message.conversation || "";
            } else {
                text =
                    message.extendedTextMessage?.text || "";
            }

            global.antiDelStore.set(id, {
                id,
                chatId,
                sender,
                pushName,
                type,
                text,
                timestamp: Date.now()
            });

            return;
        }

        // ------------------------------------------------
        // MEDIA
        // ------------------------------------------------

        const mediaTypes = [
            "imageMessage",
            "videoMessage",
            "audioMessage",
            "stickerMessage",
            "documentMessage"
        ];

        if (!mediaTypes.includes(type)) {
            return;
        }

        console.log(
            `💾 Anti-Delete saving ${type}: ${id}`
        );

        let buffer;

        try {
            buffer = await downloadMediaMessage(
                {
                    key: msg.key,
                    message: msg.message
                },
                "buffer",
                {},
                {
                    logger: {
                        info() {},
                        error() {},
                        warn() {},
                        debug() {},
                        trace() {},
                        child() {
                            return this;
                        }
                    }
                }
            );
        } catch (downloadError) {
            console.error(
                `❌ Failed to save ${type}:`,
                downloadError.message
            );

            return;
        }

        if (!buffer || !buffer.length) {
            console.log(`⚠️ Empty media: ${id}`);
            return;
        }

        const extension = getExtension(type, message[type]);

        const chatFolder = path.join(
            MEDIA_DIR,
            safeName(chatId)
        );

        if (!fs.existsSync(chatFolder)) {
            fs.mkdirSync(chatFolder, {
                recursive: true
            });
        }

        const filePath = path.join(
            chatFolder,
            `${safeName(id)}.${extension}`
        );

        fs.writeFileSync(filePath, buffer);

        global.antiDelStore.set(id, {
            id,
            chatId,
            sender,
            pushName,
            type,
            filePath,
            mimetype: message[type]?.mimetype,
            fileName:
                message[type]?.fileName ||
                `recovered.${extension}`,
            caption:
                message[type]?.caption || "",
            ptt:
                message[type]?.ptt || false,
            timestamp: Date.now()
        });

        console.log(
            `✅ Anti-Delete saved ${type}: ${filePath}`
        );

    } catch (e) {
        console.error(
            "❌ Anti-Delete store error:",
            e.message
        );
    }
}

// ------------------------------------------------------
// RECOVER DELETED MESSAGE
// ------------------------------------------------------

async function recoverDeleted(sock, revokeMessage) {
    try {
        const protocol =
            revokeMessage?.message?.protocolMessage;

        if (!protocol) return;

        const deletedKey = protocol.key;

        if (!deletedKey?.id) return;

        const chatId =
            deletedKey.remoteJid ||
            revokeMessage.key?.remoteJid;

        if (!chatId) return;

        // Anti-delete OFF
        if (!isAntiDel(chatId)) return;

        const saved =
            global.antiDelStore.get(deletedKey.id);

        if (!saved) {
            console.log(
                `⚠️ Deleted message not found: ${deletedKey.id}`
            );
            return;
        }

        console.log(
            `♻️ Recovering deleted ${saved.type}`
        );

        const senderTag =
            saved.sender &&
            saved.sender.includes("@")
                ? `@${saved.sender.split("@")[0]}`
                : saved.pushName;

        const header =
            `♻️ *ANTI-DELETE RECOVERED*\n\n` +
            `👤 *Sender:* ${saved.pushName}\n` +
            `📱 *User:* ${senderTag}\n\n`;

        // ------------------------------------------------
        // TEXT
        // ------------------------------------------------

        if (
            saved.type === "conversation" ||
            saved.type === "extendedTextMessage"
        ) {
            await sock.sendMessage(chatId, {
                text:
                    header +
                    `💬 *Message:*\n${saved.text || ""}`,
                mentions: saved.sender
                    ? [saved.sender]
                    : []
            });

            global.antiDelStore.delete(deletedKey.id);
            return;
        }

        // ------------------------------------------------
        // MEDIA
        // ------------------------------------------------

        if (
            saved.filePath &&
            fs.existsSync(saved.filePath)
        ) {
            const buffer =
                fs.readFileSync(saved.filePath);

            const caption =
                header +
                (saved.caption
                    ? `\n📝 ${saved.caption}`
                    : "");

            // IMAGE
            if (saved.type === "imageMessage") {
                await sock.sendMessage(chatId, {
                    image: buffer,
                    caption,
                    mentions: saved.sender
                        ? [saved.sender]
                        : []
                });
            }

            // VIDEO
            else if (saved.type === "videoMessage") {
                await sock.sendMessage(chatId, {
                    video: buffer,
                    caption,
                    mentions: saved.sender
                        ? [saved.sender]
                        : []
                });
            }

            // AUDIO / VOICE
            else if (saved.type === "audioMessage") {
                await sock.sendMessage(chatId, {
                    audio: buffer,
                    mimetype:
                        saved.mimetype ||
                        "audio/ogg; codecs=opus",
                    ptt: Boolean(saved.ptt)
                });
            }

            // STICKER
            else if (saved.type === "stickerMessage") {
                await sock.sendMessage(chatId, {
                    sticker: buffer
                });
            }

            // DOCUMENT
            else if (saved.type === "documentMessage") {
                await sock.sendMessage(chatId, {
                    document: buffer,
                    mimetype:
                        saved.mimetype ||
                        "application/octet-stream",
                    fileName:
                        saved.fileName ||
                        "recovered-file",
                    caption
                });
            }

            console.log(
                `✅ Recovered ${saved.type}`
            );
        }

        // RAM entry remove
        global.antiDelStore.delete(deletedKey.id);

    } catch (e) {
        console.error(
            "❌ Anti-Delete recovery error:",
            e.message
        );
    }
}

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------

function safeName(value) {
    return String(value)
        .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getExtension(type, data) {
    if (type === "imageMessage") {
        const mime = data?.mimetype || "";

        if (mime.includes("png")) return "png";
        if (mime.includes("webp")) return "webp";

        return "jpg";
    }

    if (type === "videoMessage") {
        return "mp4";
    }

    if (type === "audioMessage") {
        return "ogg";
    }

    if (type === "stickerMessage") {
        return "webp";
    }

    if (type === "documentMessage") {
        const name = data?.fileName || "";

        const ext = path
            .extname(name)
            .replace(".", "");

        return ext || "bin";
    }

    return "bin";
}

module.exports = {
    setAntiDel,
    isAntiDel,
    storeMessage,
    recoverDeleted
};