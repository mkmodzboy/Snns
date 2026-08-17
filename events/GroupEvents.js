// === GroupEvents.js ===
const { isJidGroup } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// ========== TRACK SENT MESSAGES ==========
const sentTracker = new Set();

// ========== SETTINGS FILES ==========
const SETTINGS_DIR = './database';
const WELCOME_FILE = path.join(SETTINGS_DIR, 'welcome.json');
const GOODBYE_FILE = path.join(SETTINGS_DIR, 'goodbye.json');

// Ensure database directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

// Load settings
function loadSettings(file) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (e) {}
    return {};
}

// Check if enabled
function isEnabled(groupId, file) {
    const settings = loadSettings(file);
    return settings[groupId] === true;
}

module.exports = async (conn, update) => {
    try {
        const { id, participants, action } = update;
        if (!id || !isJidGroup(id) || !participants) return;

        for (const participant of participants) {
            const userName = participant.split("@")[0];
            
            // Duplicate check
            const msgKey = `${id}_${action}_${participant}`;
            if (sentTracker.has(msgKey)) {
                console.log(`⏭️ Already sent ${action} for ${userName}, skipping...`);
                continue;
            }

            // ========== WELCOME ==========
            if (action === "add") {
                if (!isEnabled(id, WELCOME_FILE)) {
                    console.log(`⏭️ Welcome disabled for ${id}`);
                    continue;
                }
                
                sentTracker.add(msgKey);

                const welcomeText = `@${userName} *_ᗯᗴᒪᑕᗝᗰᗴ  ᕼᗝǤƳᗩ  ᗩᑭᛕᗩ  ᗪᗝᔕ丅 💗👀🥹_*`;

                await conn.sendMessage(id, {
                    text: welcomeText,
                    mentions: [participant]
                });
                
                console.log(`✅ Welcome sent to ${userName}`);
            }

            // ========== GOODBYE ==========
            else if (action === "remove") {
                if (!isEnabled(id, GOODBYE_FILE)) {
                    console.log(`⏭️ Goodbye disabled for ${id}`);
                    continue;
                }
                
                sentTracker.add(msgKey);

                const goodbyeText = `@${userName} *_left us we will miss😔💗_*`;

                await conn.sendMessage(id, {
                    text: goodbyeText,
                    mentions: [participant]
                });
                
                console.log(`✅ Goodbye sent to ${userName}`);
            }
        }

    } catch (err) {
        console.error("GroupEvents error:", err);
    }
};