// === commands/antilink warn.js ===
const { getSetting, setSetting } = require('../Settings.js');

module.exports = {
    pattern: "antilink warn",
    desc: "Warn users who post links (Admin only)",
    category: "group",
    filename: __filename,
    use: ".antilink warn on/off",

    execute: async (conn, message, m, { from, isGroup, isAdmins, isCreator, reply, args }) => {
        try {
            if (!isGroup) return reply("❌ Group only!");
            if (!isAdmins && !isCreator) return reply("❌ Admin only!");
            if (!args[0]) return reply("📌 Usage: .antilink warn on/off");

            if (args[0].toLowerCase() === 'on') {
                setSetting(from, "antilink", "warn");
                return reply("🛡️ Anti-link enabled in *WARN MODE*\n\n⚠️ Users will be kicked after 3 warnings.");
            } 
            
            if (args[0].toLowerCase() === 'off') {
                setSetting(from, "antilink", false);
                return reply("🚫 Anti-link disabled for this group.");
            }
            
            return reply("📌 Usage: .antilink warn on/off");

        } catch (error) {
            console.error("Antilink warn error:", error);
            reply("⚠️ Failed to toggle anti-link.");
        }
    }
};