// === commands/antideletedm.js ===
const { getSetting, setSetting } = require('../Settings.js');

module.exports = {
    pattern: "antideletedm",
    desc: "Toggle anti-delete for DMs",
    category: "owner",
    filename: __filename,
    use: ".antideletedm on/off",

    execute: async (conn, message, m, { from, isCreator, reply, args }) => {
        try {
            if (!isCreator) return reply("❌ Owner only!");
            if (!args[0]) return reply("📌 Usage: .antideletedm on/off");

            if (args[0].toLowerCase() === 'on') {
                setSetting('bot', "antideletedm", true);
                global.antiDeleteDM = true;
                return reply("✅ Anti-delete DM enabled!\n\n🔍 Deleted DM messages will be forwarded to bot owner.");
            } 
            
            if (args[0].toLowerCase() === 'off') {
                setSetting('bot', "antideletedm", false);
                global.antiDeleteDM = false;
                return reply("❌ Anti-delete DM disabled!");
            }
            
            return reply("📌 Usage: .antideletedm on/off");

        } catch (error) {
            console.error("Anti-delete DM error:", error);
            reply("⚠️ Failed to toggle anti-delete DM.");
        }
    }
};