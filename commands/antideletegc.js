// === commands/antideletegc.js ===
const { getSetting, setSetting } = require('../Settings.js');

module.exports = {
    pattern: "antideletegc",
    desc: "Toggle anti-delete for groups",
    category: "group",
    filename: __filename,
    use: ".antideletegc on/off",

    execute: async (conn, message, m, { from, isGroup, isAdmins, isCreator, reply, args }) => {
        try {
            if (!isGroup) return reply("❌ Group only!");
            if (!isAdmins && !isCreator) return reply("❌ Admin only!");
            if (!args[0]) return reply("📌 Usage: .antideletegc on/off");

            if (args[0].toLowerCase() === 'on') {
                setSetting(from, "antideletegc", true);
                return reply("✅ Anti-delete GROUP enabled!\n\n🔍 Deleted group messages will be forwarded to bot owner.");
            } 
            
            if (args[0].toLowerCase() === 'off') {
                setSetting(from, "antideletegc", false);
                return reply("❌ Anti-delete GROUP disabled!");
            }
            
            return reply("📌 Usage: .antideletegc on/off");

        } catch (error) {
            console.error("Anti-delete GC error:", error);
            reply("⚠️ Failed to toggle anti-delete group.");
        }
    }
};