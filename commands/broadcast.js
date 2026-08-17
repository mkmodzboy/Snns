// === commands/broadcast.js ===
module.exports = {
    pattern: "broadcast",
    alias: ["bc"],
    desc: "Broadcast message, image or video to all groups (Owner only)",
    category: "owner",
    filename: __filename,
    use: ".broadcast <text> OR reply to image/video",

    execute: async (conn, message, m, { from, isCreator, reply, args, q }) => {
        try {
            // Owner check
            if (!isCreator) return reply("❌ Owner only!");

            // Check media type
            const hasText = q && q.trim().length > 0;
            const hasQuotedImage = m.quoted && m.quoted.mtype === 'imageMessage';
            const hasQuotedVideo = m.quoted && m.quoted.mtype === 'videoMessage';

            if (!hasText && !hasQuotedImage && !hasQuotedVideo) {
                return reply(`📌 *Usage:*\n${global.prefix || '.'}broadcast Hello everyone!\n\nOr reply to an image/video with: ${global.prefix || '.'}broadcast`);
            }

            // Get all groups
            const groups = await conn.groupFetchAllParticipating();
            const groupIds = Object.keys(groups);
            
            if (groupIds.length === 0) {
                return reply("❌ No groups found!");
            }

            await reply(`📢 Broadcasting to ${groupIds.length} groups...`);

            // Newsletter context
            const NEWSLETTER_JID = "120363425629935700@newsletter";
            const NEWSLETTER_NAME = "𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 💀";
            
            const contextInfo = {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: NEWSLETTER_JID,
                    newsletterName: NEWSLETTER_NAME,
                    serverMessageId: -1
                }
            };

            // Broadcast text message
            let bcText = `╭─〔 ʙʀᴏᴀᴅᴄᴀsᴛ ʙʏ ᴏᴡɴᴇʀ 〕\n│ ${q ? q.split('\n').join('\n│ ') : 'Broadcast message'}\n╰─⸻⸻⸻⸻`;

            let successCount = 0;
            let failCount = 0;

            for (let id of groupIds) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // delay
                
                try {
                    if (hasQuotedImage) {
                        // Send IMAGE
                        const media = await conn.downloadAndSaveMediaMessage(m.quoted);
                        await conn.sendMessage(id, {
                            image: { url: media },
                            caption: bcText,
                            contextInfo
                        });
                    } 
                    else if (hasQuotedVideo) {
                        // Send VIDEO (no duration limit)
                        const media = await conn.downloadMediaMessage(m.quoted);
                        await conn.sendMessage(id, {
                            video: media,
                            caption: bcText,
                            mimetype: 'video/mp4',
                            contextInfo
                        });
                    } 
                    else {
                        // Send TEXT only
                        await conn.sendMessage(id, {
                            text: bcText,
                            contextInfo
                        });
                    }
                    successCount++;
                } catch (err) {
                    console.error(`❌ Broadcast to ${id} failed:`, err.message);
                    failCount++;
                }
            }

            reply(`✅ Broadcast finished!\n\n📤 Success: ${successCount}\n❌ Failed: ${failCount}`);

        } catch (err) {
            console.error("Broadcast error:", err);
            reply("❌ Failed to broadcast.");
        }
    }
};