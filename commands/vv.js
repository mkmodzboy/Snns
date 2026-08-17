// === commands/jadu.js ===
module.exports = {
    pattern: "vv",
    alias: ["wow", "nice", "mashallah", "good", "cool"],
    desc: "Save view once media (image/video/audio) to DM",
    category: "tools",
    filename: __filename,
    use: ".jadu or .vv (reply to view once media)",

    execute: async (conn, message, m, { from, reply, sender, prefix, command }) => {
        try {
            // Check if replying to a message
            if (!m.quoted) {
                return reply(`*Reply to an image, video, or audio with the caption ${prefix + command}*`);
            }

            let mime = (m.quoted.msg || m.quoted).mimetype || '';

            try {
                if (/image/.test(mime)) {
                    let media = await m.quoted.download();
                    await conn.sendMessage(sender, {
                        image: media,
                        caption: "✅ View once image sent to your DM",
                    });
                    await reply("✅ Image saved! Check your DM.");
                    
                } else if (/video/.test(mime)) {
                    let media = await m.quoted.download();
                    await conn.sendMessage(sender, {
                        video: media,
                        caption: "✅ View once video sent to your DM",
                    });
                    await reply("✅ Video saved! Check your DM.");
                    
                } else if (/audio/.test(mime)) {
                    let media = await m.quoted.download();
                    await conn.sendMessage(sender, {
                        audio: media,
                        mimetype: 'audio/mpeg',
                        ptt: true
                    });
                    await reply("✅ Audio saved! Check your DM.");
                    
                } else {
                    reply(`❌ Unsupported media type!\nReply to an image, video, or audio with *${prefix + command}*`);
                }
            } catch (err) {
                console.error('Error processing media:', err);
                reply(`Failed to process media. Please try again.`);
            }

        } catch (err) {
            console.error("Jadu command error:", err);
            reply("❌ Failed to save media.");
        }
    }
};