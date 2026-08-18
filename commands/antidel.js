const { setAntiDel, isAntiDel } = require("../antidelSystem");

module.exports = {
    pattern: "antidelete",
    alias: ["antidel", "anti-delete"],
    desc: "Toggle anti-delete for the current chat",
    category: "security",

    execute: async (conn, message, m, { reply, from, args }) => {
        try {
            const value = String(args?.[0] || "").trim().toLowerCase();

            if (!value) {
                return reply(
                    `🛡️ *ANTI-DELETE*\n\n` +
                    `Status: *${isAntiDel(from) ? "ON ✅" : "OFF ❌"}*\n\n` +
                    `Use .antidelete on\n` +
                    `Use .antidelete off`
                );
            }

            if (value !== "on" && value !== "off") {
                return reply("📌 Usage: .antidelete on/off");
            }

            const enabled = value === "on";
            setAntiDel(from, enabled);

            return reply(
                enabled
                    ? "🛡️ *ANTI-DELETE ENABLED* ✅\n\nDeleted messages will be recovered in this chat."
                    : "🛡️ *ANTI-DELETE DISABLED* ❌"
            );
        } catch (error) {
            console.error("❌ Anti-delete command error:", error);
            return reply(`❌ Anti-Delete failed: ${error.message}`);
        }
    }
};
