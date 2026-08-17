const axios = require("axios");

module.exports = {
    pattern: "pair",
    desc: "Connect your WhatsApp to QADEER-XD for enhanced features",
    react: "💓",
    category: "utility",
    filename: __filename,

    execute: async (conn, mek, m, { from, args, q, reply }) => {
        // Helper function to send messages with contextInfo
        const sendMessageWithContext = async (text, quoted = mek) => {
            return await conn.sendMessage(from, {
                text: text,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363418906972955@newsletter",
                        newsletterName: "𝐐α͜͡𝐝εεɼ𝐗𝐓ε𝐜𝐡",
                        serverMessageId: 200
                    }
                }
            }, { quoted: quoted });
        };

        try {
            // React with key emoji
            if (module.exports.react) {
                await conn.sendMessage(from, { react: { text: module.exports.react, key: mek.key } });
            }

            const pairingMessage = `🔑 *ϙᴀᴅᴇᴇʀ-xᴅ - ᴍɪɴɪ Pairing Instructions* 🔑\n\n` +
                                `🌐 *Pairing Link:* https://qadeerxtech.onrender.com\n\n` +
                                `📋 *How to connect:*\n` +
                                `1. Enter your WhatsApp number with country code (no "+", no brackets, no spaces)\n` +
                                `2. Click "Request Pairing Code"\n` +
                                `3. Copy the 8-digit code\n` +
                                `4. Open WhatsApp → Settings → Linked Devices → Link a Device\n` +
                                `5. Paste the code when prompted\n\n` +
                                `💡 *Example:*\n` +
                                `Number: 923300005253 (for US number)\n` +
                                `Format: Country code + Number without spaces/symbols\n\n` +
                                `✅ *Benefits:*\n` +
                                `• Enhanced media downloading\n` +
                                `• Better quality audio/video\n` +
                                `• Opens view once \n\n` +
                                `> _ᴘᴏᴡᴇʀᴇᴅ ʙʏ ϙᴀᴅᴇᴇʀ-xᴅ - ᴍɪɴɪ_`;

            await sendMessageWithContext(pairingMessage);

        } catch (e) {
            console.error("❌ Pair Command Error:", e.message);
            await sendMessageWithContext(`⚠️ Error: ${e.message}`);
        }
    }
};