const axios = require('axios');

module.exports = {
    pattern: "inbox",
    desc: "Check your temporary email inbox",
    category: "utility",
    react: "📬",
    filename: __filename,
    use: ".inbox [session_id]",

    execute: async (conn, message, m, { from, q, reply }) => {
        // Helper function to send messages with contextInfo
        const sendMessageWithContext = async (text, quoted = message) => {
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
            const sessionId = q;
            if (!sessionId) return await sendMessageWithContext('🔑 Please provide your session ID\nExample: .inbox YOUR_SESSION_ID');

            // React 📬
            if (module.exports.react) {
                await conn.sendMessage(from, { react: { text: module.exports.react, key: message.key } });
            }

            const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(sessionId)}`;
            const response = await axios.get(inboxUrl);

            if (!response.data.success) {
                return await sendMessageWithContext('❌ Invalid session ID or expired email');
            }

            const { inbox_count, messages } = response.data;

            if (inbox_count === 0) {
                return await sendMessageWithContext('📭 Your inbox is empty');
            }

            let messageList = `📬 *You have ${inbox_count} message(s)*\n\n`;
            messages.forEach((msg, index) => {
                messageList += `━━━━━━━━━━━━━━━━━━\n` +
                              `📌 *Message ${index + 1}*\n` +
                              `👤 *From:* ${msg.from}\n` +
                              `📝 *Subject:* ${msg.subject}\n` +
                              `⏰ *Date:* ${new Date(msg.date).toLocaleString()}\n\n` +
                              `📄 *Content:*\n${msg.body}\n\n`;
            });

            await sendMessageWithContext(messageList);

        } catch (e) {
            console.error('CheckMail error:', e);
            await sendMessageWithContext(`❌ Error checking inbox: ${e.response?.data?.message || e.message}`);
        }
    }
};