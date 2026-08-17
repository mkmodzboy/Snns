// === commands/owner.js ===
module.exports = {
    pattern: "owner",
    desc: "Get bot owner contact card",
    category: "info",
    filename: __filename,
    use: ".owner",

    execute: async (conn, message, m, { from, reply }) => {
        try {
            // Contact 1
            const vcard1 = 'BEGIN:VCARD\n' +
                          'VERSION:3.0\n' +
                          'FN:𝗦 𝗜 𝗟 𝗩 𝗘 𝗥\n' +
                          'TEL;type=CELL;type=VOICE;waid=96899861161:+968 9986 1161\n' +
                          'END:VCARD';

            // Contact 2
            const vcard2 = 'BEGIN:VCARD\n' +
                          'VERSION:3.0\n' +
                          'FN:𝗭 𝗔 𝗠 𝗔 𝗡\n' +
                          'TEL;type=CELL;type=VOICE;waid=97466784024:+974 6678 4024\n' +
                          'END:VCARD';

            // Send both contacts in ONE message
            await conn.sendMessage(from, {
                contacts: {
                    displayName: '𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 💀 Owners',
                    contacts: [
                        { vcard: vcard1 },
                        { vcard: vcard2 }
                    ]
                }
            }, { quoted: message });

        } catch (err) {
            console.error("Owner command error:", err);
            reply("❌ Failed to send contact card.");
        }
    }
};