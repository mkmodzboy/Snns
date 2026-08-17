// === propose.js ===
module.exports = {
    pattern: "propose",
    desc: "Send a romantic propose line to someone",
    category: "fun",
    react: "💗",
    use: ".propose @user or .propose name",
    filename: __filename,

    execute: async (conn, message, m, { q, reply, from, isGroup, sender, args }) => {
        try {
            // Only works in groups
            if (!isGroup) {
                return reply("❌ This command only works in groups!");
            }

            // Target user (mention or reply or text)
            let target = m.mentionedJid?.[0] || m.quoted?.sender || null;
            let name = q ? q.trim() : '';

            // If no target and no name
            if (!target && !name) {
                return reply(`💗 *Example:*\n${global.prefix || '.'}propose @user\n${global.prefix || '.'}propose John`);
            }

            // Propose lines
            const lines = [
                "*_Ao Hide and seek khely mein apko Pkrunga ga andhery mein🥹👀💋_*",
                "*_Ao apko sb sy Dor ly jaon jha ap mujh pr chrna or mein ap pr🥹👀_*",
                "*_Kash Tum Meri Bandi hoti or aesa he ek Gc uh k or apny Naam pr bnata🥹💋👀_*",
                "*_Jawn I love you From My Chota Heart🥹💋💗_*",
                "*_Tum itne ache ho ke main bhool gaya main tha kahan🥹💋_*",
                "*_Tum bin adhoora hun, tum se hi mukammal hoon🥹💋_*",
                "*_Tumhe dekh kar lagta hai khuda ne apna best banaya hai💗👀_*",
                "*_Tumse milke lagta hai jaise dhundh liya maine apna sukoon🥹💋_*",
                "*_Tum muskura do to lagta hai duniya roshan ho gayi🥹💗_*"
            ];

            // Random selection
            const randomLine = lines[Math.floor(Math.random() * lines.length)];

            let proposeText = '';

            // If target JID is available
            if (target) {
                const targetName = target.split('@')[0];
                proposeText = `@${targetName} ${randomLine}`;
                await conn.sendMessage(from, {
                    text: proposeText,
                    mentions: [target]
                }, { quoted: message });
            } 
            // If only name provided
            else if (name) {
                proposeText = `${name} ${randomLine}`;
                await reply(proposeText);
            }

        } catch (err) {
            console.error("Propose command error:", err);
            reply("❌ Failed to send propose line.");
        }
    }
};