const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

// ============================================================
// THE TECHX - ANTI-DELETE PRO
// ============================================================

const DATA_DIR = path.join(__dirname, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "antidel-settings.json");
const MEDIA_DIR = path.join(DATA_DIR, "antidel-media");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(MEDIA_DIR, { recursive: true });

if (!global.antiDelStore) global.antiDelStore = new Map();

function readSettings() {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) return {};
        const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
        return raw.trim() ? JSON.parse(raw) : {};
    } catch (error) {
        console.error("❌ Anti-Delete settings read error:", error.message);
        return {};
    }
}

function writeSettings(settings) {
    try {
        const tmp = `${SETTINGS_FILE}.tmp`;
        fs.writeFileSync(tmp, JSON.stringify(settings, null, 2));
        fs.renameSync(tmp, SETTINGS_FILE);
        return true;
    } catch (error) {
        console.error("❌ Anti-Delete settings write error:", error.message);
        return false;
    }
}

function normalizeChatId(chatId) {
    return String(chatId || "").trim();
}

function setAntiDel(chatId, enabled) {
    chatId = normalizeChatId(chatId);
    if (!chatId) throw new Error("Chat ID is missing");

    const settings = readSettings();
    settings[chatId] = Boolean(enabled);

    if (!writeSettings(settings)) {
        throw new Error("Could not save antidel-settings.json");
    }

    console.log(`🛡️ Anti-Delete ${settings[chatId] ? "ON" : "OFF"} -> ${chatId}`);
    return settings[chatId];
}

function isAntiDel(chatId) {
    chatId = normalizeChatId(chatId);
    if (!chatId) return false;
    return readSettings()[chatId] === true;
}

function unwrap(message) {
    if (!message) return null;
    if (message.ephemeralMessage?.message) return unwrap(message.ephemeralMessage.message);
    if (message.viewOnceMessage?.message) return unwrap(message.viewOnceMessage.message);
    if (message.viewOnceMessageV2?.message) return unwrap(message.viewOnceMessageV2.message);
    if (message.viewOnceMessageV2Extension?.message) return unwrap(message.viewOnceMessageV2Extension.message);
    return message;
}

function getType(message) {
    const data = unwrap(message);
    if (!data) return null;

    for (const type of [
        "conversation",
        "extendedTextMessage",
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "stickerMessage",
        "documentMessage",
        "contactMessage",
        "locationMessage"
    ]) {
        if (data[type]) return type;
    }

    return null;
}

function safe(value) {
    return String(value || "").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function extension(type, data) {
    if (type === "imageMessage") {
        const mime = data?.mimetype || "";
        if (mime.includes("png")) return "png";
        if (mime.includes("webp")) return "webp";
        return "jpg";
    }
    if (type === "videoMessage") return "mp4";
    if (type === "audioMessage") return "ogg";
    if (type === "stickerMessage") return "webp";
    if (type === "documentMessage") {
        const ext = path.extname(data?.fileName || "").replace(".", "");
        return ext || "bin";
    }
    return "bin";
}

function storeKey(chatId, id) {
    return `${chatId}::${id}`;
}

function putStore(entry) {
    const composite = storeKey(entry.chatId, entry.id);
    global.antiDelStore.set(composite, entry);
    // Keep the ID alias for compatibility with older running code.
    global.antiDelStore.set(entry.id, entry);
}

function getStored(chatId, id) {
    return global.antiDelStore.get(storeKey(chatId, id)) || global.antiDelStore.get(id);
}

function deleteStored(entry, id) {
    if (entry?.chatId) global.antiDelStore.delete(storeKey(entry.chatId, id));
    global.antiDelStore.delete(id);
}

async function storeMessage(sock, msg) {
    try {
        if (!msg?.key || !msg.message) return;

        const root = unwrap(msg.message);
        if (root?.protocolMessage) return;

        const chatId = normalizeChatId(msg.key.remoteJid);
        const id = String(msg.key.id || "");

        if (!chatId || !id || !isAntiDel(chatId)) return;

        const message = unwrap(msg.message);
        const type = getType(message);
        if (!type) return;

        const sender = msg.key.participant || msg.key.remoteJid || "unknown";
        const pushName = msg.pushName || "Unknown User";

        if (type === "conversation" || type === "extendedTextMessage") {
            const text = type === "conversation"
                ? message.conversation || ""
                : message.extendedTextMessage?.text || "";

            putStore({
                id,
                chatId,
                sender,
                pushName,
                type,
                text,
                timestamp: Date.now()
            });

            console.log(`💾 Anti-Delete saved TEXT: ${chatId} -> ${id}`);
            return;
        }

        const mediaTypes = [
            "imageMessage",
            "videoMessage",
            "audioMessage",
            "stickerMessage",
            "documentMessage"
        ];

        if (!mediaTypes.includes(type)) return;

        let buffer;
        try {
            buffer = await downloadMediaMessage(
                { key: msg.key, message: msg.message },
                "buffer",
                {},
                {
                    logger: {
                        info() {},
                        error() {},
                        warn() {},
                        debug() {},
                        trace() {},
                        child() { return this; }
                    }
                }
            );
        } catch (error) {
            console.error(`❌ Anti-Delete media download failed (${type}):`, error.message);
            return;
        }

        if (!buffer || !buffer.length) {
            console.log(`⚠️ Anti-Delete media empty: ${id}`);
            return;
        }

        const data = message[type] || {};
        const folder = path.join(MEDIA_DIR, safe(chatId));
        fs.mkdirSync(folder, { recursive: true });

        const filePath = path.join(
            folder,
            `${safe(id)}.${extension(type, data)}`
        );

        fs.writeFileSync(filePath, buffer);

        putStore({
            id,
            chatId,
            sender,
            pushName,
            type,
            filePath,
            mimetype: data.mimetype,
            fileName: data.fileName || `recovered.${extension(type, data)}`,
            caption: data.caption || "",
            ptt: Boolean(data.ptt),
            timestamp: Date.now()
        });

        console.log(`💾 Anti-Delete saved ${type}: ${chatId} -> ${id}`);
    } catch (error) {
        console.error("❌ Anti-Delete store error:", error.message);
    }
}

function extractDeleteKey(revoke) {
    const protocol = revoke?.message?.protocolMessage;
    if (!protocol?.key?.id) return null;
    return protocol.key;
}

async function recoverDeleted(sock, revoke) {
    try {
        const deletedKey = extractDeleteKey(revoke);
        if (!deletedKey?.id) return false;

        const chatId = normalizeChatId(
            deletedKey.remoteJid ||
            revoke?.key?.remoteJid ||
            revoke?.chatId
        );

        if (!chatId || !isAntiDel(chatId)) {
            return false;
        }

        const saved = getStored(chatId, deletedKey.id);
        if (!saved) {
            console.log(`⚠️ Anti-Delete: message not found -> ${chatId} / ${deletedKey.id}`);
            return false;
        }

        console.log(`♻️ Anti-Delete recovering ${saved.type}: ${deletedKey.id}`);

        const mention = saved.sender?.includes("@")
            ? `@${saved.sender.split("@")[0]}`
            : saved.pushName;

        const header =
            `♻️ *ANTI-DELETE RECOVERED*\n\n` +
            `👤 *Sender:* ${saved.pushName}\n` +
            `📱 *User:* ${mention}\n\n`;

        const mentions = saved.sender?.includes("@") ? [saved.sender] : [];

        if (saved.type === "conversation" || saved.type === "extendedTextMessage") {
            await sock.sendMessage(chatId, {
                text: `${header}💬 *Message:*\n${saved.text || ""}`,
                mentions
            });
            deleteStored(saved, deletedKey.id);
            return true;
        }

        if (!saved.filePath || !fs.existsSync(saved.filePath)) {
            console.log(`⚠️ Anti-Delete media file missing: ${deletedKey.id}`);
            deleteStored(saved, deletedKey.id);
            return false;
        }

        const buffer = fs.readFileSync(saved.filePath);
        const caption = header + (saved.caption ? `\n📝 ${saved.caption}` : "");

        if (saved.type === "imageMessage") {
            await sock.sendMessage(chatId, { image: buffer, caption, mentions });
        } else if (saved.type === "videoMessage") {
            await sock.sendMessage(chatId, { video: buffer, caption, mentions });
        } else if (saved.type === "audioMessage") {
            await sock.sendMessage(chatId, {
                audio: buffer,
                mimetype: saved.mimetype || "audio/ogg; codecs=opus",
                ptt: Boolean(saved.ptt)
            });
            await sock.sendMessage(chatId, { text: header, mentions });
        } else if (saved.type === "stickerMessage") {
            await sock.sendMessage(chatId, { sticker: buffer });
            await sock.sendMessage(chatId, { text: header, mentions });
        } else if (saved.type === "documentMessage") {
            await sock.sendMessage(chatId, {
                document: buffer,
                mimetype: saved.mimetype || "application/octet-stream",
                fileName: saved.fileName || "recovered-file",
                caption,
                mentions
            });
        } else {
            deleteStored(saved, deletedKey.id);
            return false;
        }

        console.log(`✅ Anti-Delete recovered ${saved.type}: ${deletedKey.id}`);
        deleteStored(saved, deletedKey.id);
        return true;
    } catch (error) {
        console.error("❌ Anti-Delete recovery error:", error.message);
        return false;
    }
}

module.exports = {
    setAntiDel,
    isAntiDel,
    storeMessage,
    recoverDeleted
};
