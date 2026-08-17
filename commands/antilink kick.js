// === commands/antilink kick.js ===
const { getSetting, setSetting } = require('../Settings.js');

module.exports = {
    pattern: "antilink kick",
    desc: "Kick users who post links (Admin only)",
    category: "group",
    filename: __filename,
    use: ".antilink kick on/off",

    execute: async (conn, message, m, { from, isGroup, isAdmins, isCreator, reply, args }) => {
        try {
            if (!isGroup) return reply("❌ Group only!");
            if (!isAdmins && !isCreator) return reply("❌ Admin only!");
            if (!args[0]) return reply("📌 Usage: .antilink kick on/off");

            if (args[0].toLowerCase() === 'on') {
                setSetting(from, "antilink", "kick");
                return reply("🛡️ Anti-link enabled in *KICK MODE*\n\n⚠️ Users who post links will be instantly kicked.");
            } 
            
            if (args[0].toLowerCase() === 'off') {
                setSetting(from, "antilink", false);
                return reply("🚫 Anti-link disabled for this group.");
            }
            
            return reply("📌 Usage: .antilink kick on/off");

        } catch (error) {
            console.error("Antilink kick error:", error);
            reply("⚠️ Failed to toggle anti-link.");
        }
    }
};