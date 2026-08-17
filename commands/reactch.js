// === commands/reactch.js ===
const axios = require('axios');

module.exports = {
    pattern: "reactch",
    alias: ["rch", "channelreact"],
    desc: "React to a WhatsApp channel post",
    category: "tools",
    filename: __filename,
    use: ".reactch <channel_link> <emoji1,emoji2>",

    execute: async (conn, message, m, { from, reply, args, q, prefix, command }) => {
        try {
            if (!q) {
                return reply(`╭━━〔 ⚡ ᴄʜᴀɴɴᴇʟ ʀᴇᴀᴄᴛᴏʀ 〕━━┈⊷
┃
┃ 📝 *Usᴀɢᴇ:*
┃ ${prefix}${command} <ʟɪɴᴋ> <ᴇᴍᴏᴊɪ1,ᴇᴍᴏᴊɪ2>
┃
┃ 💡 *Exᴀᴍᴘʟᴇ:*
┃ ${prefix}${command} https://whatsapp.com/channel/0029VbDKjmv7IUYP9uQj2g2h/413 😭,🔥
┃
┃ ⚠️ *Mᴀx 4 ᴇᴍᴏᴊɪs ᴀʟʟᴏᴡᴇᴅ*
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷`);
            }

            await conn.sendMessage(from, { react: { text: '🕒', key: message.key } });
            
            const messageText = (q || '').trim();
            const argsList = messageText.split(/\s+/).filter(Boolean);
            
            const postLink = argsList[0];
            const reactsRaw = argsList.slice(1).join(' ');

            if (!postLink || !postLink.includes('whatsapp.com/channel/')) {
                return reply('❌ Invalid WhatsApp channel link.');
            }
            if (!reactsRaw) {
                return reply('❌ No emojis provided.');
            }

            const emojis = reactsRaw.split(',').map(e => e.trim()).filter(Boolean);
            if (emojis.length > 4) {
                return reply('❌ Max 4 emojis allowed.');
            }

            // 1. Get Recaptcha Token
            const { data: captchaData } = await axios.get('https://omegatech-api.dixonomega.tech/api/tools/recaptcha-v3', {
                params: {
                    sitekey: '6LemKk8sAAAAAH5PB3f1EspbMlXjtwv5C8tiMHSm',
                    url: 'https://back.asitha.top/api',
                    use_enterprise: 'false'
                }
            });

            if (!captchaData?.success || !captchaData?.token) {
                throw new Error('Recaptcha bypass failed');
            }

            const userJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZGNjM2MyMjgzMGQzNGZiMzIwMzc5OSIsImlhdCI6MTc3NjQ1MjI1MywiZXhwIjoxNzc3MDU3MDUzfQ.DuaYpoDrUmF39HjOi2ulk14dZHEWLmSxWH4_MIooaOk';
            const backendUrl = 'https://back.asitha.top/api';

            // 2. Get Temp API Key
            const { data: tempKeyData } = await axios.post(`${backendUrl}/user/get-temp-token`, 
                { recaptcha_token: captchaData.token },
                { headers: { Authorization: `Bearer ${userJwt}`, 'Content-Type': 'application/json' } }
            );

            if (!tempKeyData?.token) {
                throw new Error('Temp API key failed');
            }

            // 3. Send Reaction
            const reactRes = await axios.post(`${backendUrl}/channel/react-to-post?apiKey=${tempKeyData.token}`, 
                { post_link: postLink, reacts: emojis.join(',') },
                { headers: { Authorization: `Bearer ${userJwt}`, 'Content-Type': 'application/json' } }
            );

            if (reactRes.status < 200 || reactRes.status >= 300) {
                throw new Error(reactRes.data?.message || 'Failed to send reaction');
            }

            await conn.sendMessage(from, { react: { text: '✅', key: message.key } });
            
            reply(`╭━━〔 🔥 ʀᴇᴀᴄᴛɪᴏɴ sᴇɴᴛ 〕━━┈⊷
┃
┃ 🔗 ʟɪɴᴋ: ${postLink}
┃ 😊 ᴇᴍᴏᴊɪs: ${emojis.join(', ')}
┃
┃ ✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴀᴄᴛᴇᴅ!
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷`);

        } catch (e) {
            console.error('Channel React Error:', e);
            await conn.sendMessage(from, { react: { text: '❌', key: message.key } });
            reply(`❌ *Failed:* ${e.response?.data?.message || e.message}`);
        }
    }
};