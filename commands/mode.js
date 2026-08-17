// === commands/mode.js ===
const fs = require('fs');
const path = require('path');

module.exports = {
    pattern: "mode",
    desc: "Check or change bot mode (Public/Private)",
    category: "owner",
    filename: __filename,
    use: ".mode / .mode public / .mode private",

    execute: async (conn, message, m, { from, isCreator, reply, args }) => {
        try {
            if (!isCreator) return reply("❌ Owner only!");

            // Get current mode from bot
            let currentMode = conn.public ? "public" : "private";
            
            // If no args, show current mode
            if (!args[0]) {
                return reply(`⚙️ *Bot Mode*\n\n📌 Current mode: *${currentMode.toUpperCase()}*\n\n📝 Usage:\n.mode public - Public mode (everyone can use)\n.mode private - Private mode (only owner can use)`);
            }

            const mode = args[0].toLowerCase();
            const botModeFile = path.join(__dirname, '../database', 'botmode.txt');

            // Ensure directory exists
            const dir = path.dirname(botModeFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            if (mode === 'public') {
                conn.public = true;
                fs.writeFileSync(botModeFile, 'public');
                return reply("✅ *Public mode ON*\n\nEveryone can use the bot now.");
            } 
            
            if (mode === 'private' || mode === 'self') {
                conn.public = false;
                fs.writeFileSync(botModeFile, 'private');
                return reply("✅ *Private mode ON*\n\nOnly bot owner can use the bot now.");
            }
            
            return reply("❌ Invalid mode!\n\nUse: .mode public or .mode private");

        } catch (err) {
            console.error("Mode error:", err);
            reply("❌ Failed to change bot mode.");
        }
    }
};