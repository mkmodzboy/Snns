// === commands/antilink delete.js ===
const { getSetting, setSetting } = require('../Settings.js');

module.exports = {
    pattern: "antilink delete",
    desc: "Delete links only (Admin only)",
    category: "group",
    filename: __filename,
    use: ".antilink delete on/off",

    execute: async (conn, message, m, { from, isGroup, isAdmins, isCreator, reply, args }) => {
        try {
            if (!isGroup) return reply("❌ Group only!");
            if (!isAdmins && !isCreator) return reply("❌ Admin only!");
            if (!args[0]) return reply("📌 Usage: .antilink delete on/off");

            if (args[0].toLowerCase() === 'on') {
                setSetting(from, "antilink", "delete");
                return reply("🛡️ Anti-link enabled in *DELETE MODE*\n\n⚠️ Links will be deleted only.");
            } 
            
            if (args[0].toLowerCase() === 'off') {
                setSetting(from, "antilink", false);
                return reply("🚫 Anti-link disabled for this group.");
            }
            
            return reply("📌 Usage: .antilink delete on/off");

        } catch (error) {
            console.error("Antilink delete error:", error);
            reply("⚠️ Failed to toggle anti-link.");
        }
    }
};