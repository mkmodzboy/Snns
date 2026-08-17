// === commands/gali.js ===
module.exports = {
    pattern: "gali",
    desc: "Send random insults to someone",
    category: "fun",
    filename: __filename,
    use: ".gali @user or .gali name",

    execute: async (conn, message, m, { from, reply, args, q, isGroup, sender, prefix, command }) => {
        try {
            // Target user (mention / reply / text)
            let target = m.mentionedJid?.[0] || m.quoted?.sender || null;
            let name = q ? q.trim().toLowerCase() : '';

            if (!target && !name) {
                return reply(`Example:\n${prefix + command} name\n${prefix + command} @user`);
            }

            // Blocked names
            let blocked = ['silver', 'talha', 'ashir', 'zaman', 'haji zaman'];

            if (blocked.includes(name)) {
                // Random blocked reply
                let blockedReplies = [
                    `${name.toUpperCase()} *_Tari maa ka sath soya tha? Laudy_*`,
                    `${name.toUpperCase()} *_Tari amma ka yaar ha...?_*`
                ];
                let randomBlocked = blockedReplies[Math.floor(Math.random() * blockedReplies.length)];

                return conn.sendMessage(from, {
                    text: randomBlocked,
                    mentions: [sender]
                }, { quoted: message });
            }

            // Random gali list (UPDATED with new lines)
            let galis = [
                `${q || '@' + target?.split('@')[0]} - *_teri mkc bc laudy gando bsdk bkl 💀 (3 baar)_*`,
                `${q || '@' + target?.split('@')[0]} - *_salay tata madarchod randwe gando mkc Tari 🤡 (2 baar)_*`,
                `${q || '@' + target?.split('@')[0]} - *_bkl habshi ki paidaawar barhwy mkc tari😈 (4 baar)_*`,
                `${q || '@' + target?.split('@')[0]} *_Teri MKC Randi K Bachy (7 baar)🤡🚮_*`,
                `${q || '@' + target?.split('@')[0]} *_Idher a Teri Mama K Oper Charh kr Dance krun🤡🥹_*`,
                `${q || '@' + target?.split('@')[0]} *_Hi YATEEM TATTY Idher A Lun pr Beth kr Jholly kha_*`,
                `${q || '@' + target?.split('@')[0]} *_Teri Ama Dy Akha Vch Akha Paa k Ondy Mou Vch Lul🤡🚮_*`,
                `${q || '@' + target?.split('@')[0]} *_Idher A O Pooli Bondd Aliya🥸🤡_*`
            ];

            let random = galis[Math.floor(Math.random() * galis.length)];

            // Mention system for normal gali
            if (target) {
                return conn.sendMessage(from, {
                    text: random,
                    mentions: [target]
                }, { quoted: message });
            } else {
                return reply(random);
            }

        } catch (err) {
            console.error("Gali command error:", err);
            reply("❌ Failed to send insult.");
        }
    }
};