// === menu.js ===
module.exports = {
    pattern: "menu",
    desc: "Show all available commands",
    category: "utility",
    react: "📋",
    use: ".menu",
    filename: __filename,

    execute: async (conn, message, m, { from, reply, userPrefix, isGroup }) => {
        try {
            const prefix = userPrefix || ".";
            const NEWSLETTER_JID = "120363425629935700@newsletter";
            const NEWSLETTER_NAME = "𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 💀";
            const menuImage = 'https://up6.cc/2026/04/177631893622821.jpg';

            const botName = "𓆩 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 𝙈𝘿💀𓆪";
            const ownerName = "ᘔᗩᗰᗩᑎ ᙭ Tᗩᒪᕼᗩ";
            const version = "2.0";
            const platform = "𝙏𝙚𝙡𝙚𝙜𝙧𝙖𝙢";

            const menuText = `
╭━━〔 ☠️ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ☠️ 〕━━┈⊷
┃✮╭────────────────
┃✮│ 🤖 ʙᴏᴛ  :*${botName}*
┃✮│ 👑 ᴏᴡɴᴇʀ : *${ownerName}*
┃✮│ 📦 ᴠᴇʀsɪᴏɴ  : *${version}*
┃✮│ 📡 ᴘʟᴀᴛғᴏʀᴍ : *${platform}*
┃✮╰────────────────
╰━━━━━━━━━━━━━━━┈⊷

╭━━〔 👑 ᴏᴡɴᴇʀ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ᴘᴜʙʟɪᴄ
┃✮│➣ ${prefix}sᴇʟꜰ
┃✮│➣ ${prefix}ʙʟᴏᴄᴋ
┃✮│➣ ${prefix}ᴜɴʙʟᴏᴄᴋ
┃✮│➣ ${prefix}ʙʀᴏᴀᴅᴄᴀsᴛ
┃✮│➣ ${prefix}sᴇᴛᴘᴘʙᴏᴛ
┃✮│➣ ${prefix}ᴀᴜᴛᴏʙɪᴏ
┃✮│➣ ${prefix}ᴀᴅᴅᴏᴡɴᴇʀ
┃✮│➣ ${prefix}ᴅᴇʟᴏᴡɴᴇʀ
┃✮│➣ ${prefix}ᴀᴅᴅᴘʀᴇᴍ
┃✮│➣ ${prefix}ᴅᴇʟᴘʀᴇᴍ
┃✮│➣ ${prefix}ʀᴜɴᴛɪᴍᴇ
┃✮│➣ ${prefix}sᴘᴇᴇᴅ
┃✮│➣ ${prefix}ɢᴇᴛᴘᴘ
┃✮│➣ ${prefix}ᴀᴜᴛᴏᴘʀᴇsᴇɴᴄᴇ
┃✮│➣ ${prefix}ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ
┃✮│➣ ${prefix}ᴀᴜᴛᴏᴛʏᴘɪɴɢ
┃✮│➣ ${prefix}sᴇᴛᴘʀᴇꜰɪx
┃✮│➣ ${prefix}ᴄʟᴇᴀʀᴛᴍᴘ
┃✮│➣ ${prefix}ʀᴇsᴛᴀʀᴛ
┃✮│➣ ${prefix}sᴀᴠᴇsᴛᴀᴛᴜs
┃✮│➣ ${prefix}ᴀᴜᴛᴏʀᴇᴀᴅ
┃✮│➣ ${prefix}ᴀᴜᴛᴏᴠɪᴇᴡsᴛᴀᴛᴜs
┃✮│➣ ${prefix}ᴀᴜᴛᴏʟɪᴋᴇsᴛᴀᴛᴜs
┃✮│➣ ${prefix}ꜰɪxᴏᴡɴᴇʀ
┃✮│➣ ${prefix}ᴄᴄɢᴇɴ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 👥 ɢʀᴏᴜᴘ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ᴀᴅᴅ
┃✮│➣ ${prefix}ᴋɪᴄᴋ
┃✮│➣ ${prefix}ᴋɪᴄᴋᴀʟʟ
┃✮│➣ ${prefix}ᴋɪᴄᴋᴀᴅᴍɪɴs
┃✮│➣ ${prefix}ᴘʀᴏᴍᴏᴛᴇ
┃✮│➣ ${prefix}ᴅᴇᴍᴏᴛᴇ
┃✮│➣ ${prefix}ᴘʀᴏᴍᴏᴛᴇᴀʟʟ
┃✮│➣ ${prefix}ᴅᴇᴍᴏᴛᴇᴀʟʟ
┃✮│➣ ${prefix}ᴛᴀɢᴀʟʟ
┃✮│➣ ${prefix}ʜɪᴅᴇᴛᴀɢ
┃✮│➣ ${prefix}ᴛᴀɢ
┃✮│➣ ${prefix}ɢʀᴏᴜᴘᴊɪᴅ
┃✮│➣ ${prefix}ʟɪsᴛᴀᴅᴍɪɴ
┃✮│➣ ${prefix}ʟɪsᴛᴏɴʟɪɴᴇ
┃✮│➣ ${prefix}ᴍᴜᴛᴇ
┃✮│➣ ${prefix}ᴜɴᴍᴜᴛᴇ
┃✮│➣ ${prefix}ʟɪɴᴋɢᴄ
┃✮│➣ ${prefix}ʀᴇsᴇᴛʟɪɴᴋ
┃✮│➣ ${prefix}ᴘᴏʟʟ
┃✮│➣ ${prefix}ᴅᴇʟ
┃✮│➣ ${prefix}ᴊᴏɪɴ
┃✮│➣ ${prefix}ʟᴇᴀᴠᴇ
┃✮│➣ ${prefix}ᴄʀᴇᴀᴛᴇɢᴄ
┃✮│➣ ${prefix}ᴀɴᴛɪʟɪɴᴋ
┃✮│➣ ${prefix}ᴀɴᴛɪsᴘᴀᴍ
┃✮│➣ ${prefix}ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ
┃✮│➣ ${prefix}ᴀɴᴛɪʙᴏᴛ
┃✮│➣ ${prefix}ᴀɴᴛɪʙɪʟʟ
┃✮│➣ ${prefix}ᴡᴇʟᴄᴏᴍᴇ
┃✮│➣ ${prefix}ɢᴏᴏᴅʙʏᴇ
┃✮│➣ ${prefix}ᴘʀᴏᴛᴇᴄᴛ
┃✮│➣ ${prefix}ᴀɴᴛɪʜɪᴊᴀᴄᴋ
┃✮│➣ ${prefix}ᴏᴘᴇɴɢʀᴏᴜᴘ
┃✮│➣ ${prefix}ᴄʟᴏsᴇɢʀᴏᴜᴘ
┃✮│➣ ${prefix}ᴏᴘᴇɴᴛɪᴍᴇ
┃✮│➣ ${prefix}ᴄʟᴏsᴇᴛɪᴍᴇ
┃✮│➣ ${prefix}sᴇᴛᴅᴇsᴄ
┃✮│➣ ${prefix}sᴇᴛɴᴀᴍᴇ
┃✮│➣ ${prefix}sᴇᴛᴘᴘɢᴄ
┃✮│➣ ${prefix}ᴡᴀʀɴ
┃✮│➣ ${prefix}ʀᴇsᴇᴛᴡᴀʀɴ
┃✮│➣ ${prefix}ᴡᴇʟᴄᴏᴍᴇᴄᴀʀᴅ
┃✮│➣ ${prefix}ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
┃✮│➣ ${prefix}ᴀɴᴛɪᴅᴇʟᴇᴛᴇᴅᴍ
┃✮│➣ ${prefix}ᴄʜᴀᴛʙᴏᴛ
┃✮│➣ ${prefix}ᴄʟᴇᴀʀᴄʜᴀᴛʙᴏᴛ
┃✮│➣ ${prefix}ᴄʜᴇᴄᴋᴀᴅᴍɪɴ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 📥 ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ 〕━━┈⊷
┃
┃ 🎵 ᴀᴜᴅɪᴏ
┃ ├ ${prefix}ᴘʟᴀʏ
┃ ├ ${prefix}sᴘᴏᴛɪꜰʏ
┃ └ ${prefix}ʏᴛᴍᴘ3
┃
┃ 🎥 ᴠɪᴅᴇᴏ
┃ ├ ${prefix}ʏᴛᴍᴘ4
┃ ├ ${prefix}ᴛɪᴋᴛᴏᴋ
┃ ├ ${prefix}ɪɴsᴛᴀɢʀᴀᴍ
┃ ├ ${prefix}ꜰᴀᴄᴇʙᴏᴏᴋ
┃ ├ ${prefix}ᴛᴡɪᴛᴛᴇʀ
┃ ├ ${prefix}ᴛʜʀᴇᴀᴅs
┃ └ ${prefix}ᴄᴀᴘᴄᴜᴛ
┃
┃ 📁 ꜰɪʟᴇs
┃ ├ ${prefix}ᴍᴇᴅɪᴀꜰɪʀᴇ
┃ └ ${prefix}ᴀᴘᴋ
┃
┃ 🖼️ ɪᴍᴀɢᴇs
┃ └ ${prefix}ᴘɪɴᴛᴇʀᴇsᴛ
┃
┃ 🔄 ᴄᴏɴᴠᴇʀᴛᴇʀs
┃ ├ ${prefix}ᴛᴏᴍᴘ3
┃ └ ${prefix}ᴛᴏᴍᴘ4
┃ 
┃ 🎥 ᴠɪᴅᴇᴏ ɢᴇɴᴇʀᴀᴛᴏʀ
┃ └ ${prefix}ʀᴜɴᴡᴀʏ<ᴘʀᴏᴍᴘᴛ>
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🤖 ᴀɪ ᴍᴇɴᴜ 〕━━┈⊷
┃
┃ 💬 ᴄʜᴀᴛ ᴀɪ
┃ ├ ${prefix}ᴀɪ
┃ ├ ${prefix}ᴄʜᴀᴛɢᴘᴛ
┃ ├ ${prefix}ɢᴘᴛ
┃ ├ ${prefix}ɢᴇᴍɪɴɪ
┃ ├ ${prefix}ʟʟᴀᴍᴀ
┃ ├ ${prefix}ᴅᴇᴇᴘsᴇᴇᴋ
┃ ├ ${prefix}ᴍɪsᴛʀᴀʟ
┃ └ ${prefix}ɢʀᴏǫ
┃
┃ 🎨 ɪᴍᴀɢᴇ ɢᴇɴᴇʀᴀᴛɪᴏɴ
┃ ├ ${prefix}ғʟᴜx
┃ ├ ${prefix}ᴘɪxᴀʀᴛ
┃ ├ ${prefix}sᴅxʟ
┃ ├ ${prefix}ᴘᴏʟʟɪɴᴀᴛɪᴏɴs
┃ └ ${prefix}ᴘʟᴀʏɢʀᴏᴜɴᴅ
┃
┃ 🔍 ᴅᴇᴛᴇᴄᴛɪᴏɴ
┃ └ ${prefix}ᴀɪᴅᴇᴛᴇᴄᴛ
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛠️ ᴛᴏᴏʟs ᴍᴇɴᴜ 〕━━┈⊷
┃
┃ 🔧 ᴄᴏɴᴠᴇʀsɪᴏɴ & ᴜᴛɪʟɪᴛʏ
┃ ├ ${prefix}ᴄᴜʀʀᴇɴᴄʏ
┃ ├ ${prefix}ᴄᴏɴᴠᴇʀᴛ
┃ ├ ${prefix}ᴛʀᴀɴsʟᴀᴛᴇ
┃ ├ ${prefix}ᴛʀ
┃ ├ ${prefix}ᴄᴀʟᴄ
┃ ├ ${prefix}ᴄᴀʟᴄᴜʟᴀᴛᴇ
┃ ├ ${prefix}ᴛᴛs
┃ ├ ${prefix}ᴛᴏᴜʀʟ
┃ ├ ${prefix}ᴛɪɴʏᴜʀʟ
┃ ├ ${prefix}sʜᴏʀᴛᴜʀʟ
┃ ├ ${prefix}ᴛᴏᴠɴ
┃ └ ${prefix}ʀᴇᴀᴅᴍᴏʀᴇ
┃
┃ 🎨 ɪᴍᴀɢᴇ ᴛᴏᴏʟs
┃ ├ ${prefix}ʀᴇᴍᴏᴠᴇʙɢ
┃ ├ ${prefix}ɴᴏʙɢ
┃ ├ ${prefix}ᴇɴʜᴀɴᴄᴇ
┃ ├ ${prefix}ʀᴇᴍɪɴɪ
┃ ├ ${prefix}ᴜᴘsᴄᴀʟᴇ
┃ ├ ${prefix}ʜᴅʀ
┃ ├ ${prefix}ᴅᴇʜᴀᴢᴇ
┃ ├ ${prefix}ʀᴇᴄᴏʟᴏʀ
┃ ├ ${prefix}ʙʟᴜʀ
┃ ├ ${prefix}ᴛᴏᴀɴɪᴍᴇ
┃ ├ ${prefix}ᴄᴀʀᴛᴏᴏɴ
┃ ├ ${prefix}ᴄᴀʀʙᴏɴ
┃ ├ ${prefix}ᴊᴀɪʟ
┃ └ ${prefix}ɢᴜɴ
┃
┃ 📝 ɢᴇɴᴇʀᴀᴛᴏʀs
┃ ├ ${prefix}ǫʀ
┃ ├ ${prefix}ǫʀᴄᴏᴅᴇ
┃ ├ ${prefix}ʀᴇᴀᴅǫʀ
┃ ├ ${prefix}ʙᴏᴏᴋ
┃ ├ ${prefix}ʙᴏᴏᴋᴄᴏᴠᴇʀ
┃ ├ ${prefix}ᴏʙғᴜsᴄᴀᴛᴇ
┃ └ ${prefix}ᴏʙғ
┃
┃ 🔍 sᴇᴀʀᴄʜ & ɪɴғᴏ
┃ ├ ${prefix}ʟʏʀɪᴄs
┃ ├ ${prefix}ɪᴍᴅʙ
┃ ├ ${prefix}ᴍᴏᴠɪᴇ
┃ ├ ${prefix}ʏᴛsᴇᴀʀᴄʜ
┃ ├ ${prefix}ʏᴛs
┃ ├ ${prefix}ɢᴏᴏɢʟᴇ
┃ ├ ${prefix}ᴡᴇᴀᴛʜᴇʀ
┃ ├ ${prefix}ᴡᴇᴀᴛʜᴇʀ2
┃ ├ ${prefix}ᴡᴇᴀᴛʜᴇʀɪɴғᴏ
┃ ├ ${prefix}ᴅᴇғɪɴᴇ
┃ ├ ${prefix}ᴡɪᴋɪ
┃ ├ ${prefix}ᴡɪᴋɪᴘᴇᴅɪᴀ
┃ ├ ${prefix}ɴᴇᴡs
┃ ├ ${prefix}ᴛᴇʟᴇɢʀᴀᴍ
┃ └ ${prefix}ᴛɢ
┃
┃ 🔐 ᴏᴛʜᴇʀ
┃ ├ ${prefix}sᴡᴇʙ
┃ ├ ${prefix}sᴇᴛᴘғᴘ
┃ ├ ${prefix}ʀᴜɴ
┃ ├ ${prefix}ɢᴇᴛ
┃ └ ${prefix}ᴄʜᴇᴄᴋ
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎮 ꜰᴜɴ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ᴊᴏᴋᴇ
┃✮│➣ ${prefix}ᴅᴀᴅᴊᴏᴋᴇ
┃✮│➣ ${prefix}ǫᴜᴏᴛᴇ
┃✮│➣ ${prefix}ꜰᴀᴄᴛ
┃✮│➣ ${prefix}ᴀᴅᴠɪᴄᴇ
┃✮│➣ ${prefix}ᴘɪᴄᴋᴜᴘʟɪɴᴇ
┃✮│➣ ${prefix}ʀᴏᴀsᴛ
┃✮│➣ ${prefix}ᴍᴇᴍᴇ
┃✮│➣ ${prefix}sʜɪᴘ
┃✮│➣ ${prefix}ʜᴀᴄᴋ
┃✮│➣ ${prefix}ᴄᴏᴜᴘʟᴇ
┃✮│➣ ${prefix}ꜰʟɪʀᴛ
┃✮│➣ ${prefix}ᴄᴏᴍᴘʟɪᴍᴇɴᴛ
┃✮│➣ ${prefix}ɪɴsᴜʟᴛ
┃✮│➣ ${prefix}ᴡʜᴏᴀᴍɪ
┃✮│➣ ${prefix}sᴛᴜᴘɪᴅᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ᴜɴᴄʟᴇᴀɴᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ʜᴏᴛᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}sᴍᴀʀᴛᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ɢʀᴇᴀᴛᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ᴇᴠɪʟᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ᴅᴏɢᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ᴄᴏᴏʟᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ɢᴀʏᴄʜᴇᴄᴋ
┃✮│➣ ${prefix}ᴡᴀɪꜰᴜᴄʜᴇᴄᴋ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎲 ɢᴀᴍᴇ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ᴛɪᴄᴛᴀᴄᴛᴏᴇ
┃✮│➣ ${prefix}ᴛᴛᴛ
┃✮│➣ ${prefix}ᴡᴏʀᴅᴄʜᴀɪɴ
┃✮│➣ ${prefix}ᴡᴄɢ
┃✮│➣ ${prefix}sᴜʀʀᴇɴᴅᴇʀ
┃✮│➣ ${prefix}ᴇɴᴅᴡᴄɢ
┃✮│➣ ${prefix}ᴛʀᴜᴛʜ
┃✮│➣ ${prefix}ᴅᴀʀᴇ
┃✮│➣ ${prefix}8ʙᴀʟʟ
┃✮│➣ ${prefix}ꜰʟɪᴘ
┃✮│➣ ${prefix}ᴅɪᴄᴇ
┃✮│➣ ${prefix}ᴍᴀᴛʜ
┃✮│➣ ${prefix}ᴛʀɪᴠɪᴀ
┃✮│➣ ${prefix}ʀᴘs
┃✮│➣ ${prefix}sʟᴏᴛ
┃✮│➣ ${prefix}ɢᴜᴇss
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🔍 sᴛᴀʟᴋ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ɪɢsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴛᴛsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴛᴛsᴛᴀʟᴋ2
┃✮│➣ ${prefix}ɪᴘsᴛᴀʟᴋ
┃✮│➣ ${prefix}ɢɪᴛʜᴜʙsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴛɢᴄʜᴀɴɴᴇʟsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴛɢɢʀᴏᴜᴘsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴛɢsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴡᴀsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴢᴏᴏᴍsᴇᴀʀᴄʜ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛠️ ᴜᴛɪʟɪᴛʏ 〕━━┈⊷
┃✮│➣ ${prefix}ᴄᴀᴛꜰᴀᴄᴛ
┃✮│➣ ${prefix}ᴅᴏɢꜰᴀᴄᴛ
┃✮│➣ ${prefix}ᴛᴇᴄʜɴᴇᴡs
┃✮│➣ ${prefix}ʙɪᴛʟʏ
┃✮│➣ ${prefix}sʜᴏʀᴛʟɪɴᴋ
┃✮│➣ ${prefix}ᴍᴏᴠɪᴇ
┃✮│➣ ${prefix}ɴᴇᴡs
┃✮│➣ ${prefix}ᴘɪᴄᴋᴜᴘʟɪɴᴇ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎭 ᴀɴɪᴍᴇ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ᴡᴀɪꜰᴜ
┃✮│➣ ${prefix}ɴᴡᴀɪꜰᴜ
┃✮│➣ ${prefix}ʀᴡᴀɪꜰᴜ
┃✮│➣ ${prefix}ɴᴇᴋᴏ
┃✮│➣ ${prefix}ɴᴇᴋᴏ2
┃✮│➣ ${prefix}ᴀɴɪᴍᴇsᴇᴀʀᴄʜ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇᴋɪʟʟ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇʟɪᴄᴋ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇʙɪᴛᴇ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇᴡᴀᴠᴇ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇsᴍɪʟᴇ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇᴘᴏᴋᴇ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇᴡɪɴᴋ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇʙᴏɴᴋ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇʙᴜʟʟʏ
┃✮│➣ ${prefix}ᴀɴɪᴍᴇʏᴇᴇᴛ
┃✮│➣ ${prefix}ᴀᴋɪʏᴀᴍᴀ
┃✮│➣ ${prefix}ᴀɴᴀ
┃✮│➣ ${prefix}ᴀʀᴛ
┃✮│➣ ${prefix}ᴀsᴜɴᴀ
┃✮│➣ ${prefix}ᴀʏᴜᴢᴀᴡᴀ
┃✮│➣ ${prefix}ʙᴏʀᴜᴛᴏ
┃✮│➣ ${prefix}ᴄʜɪʜᴏ
┃✮│➣ ${prefix}ᴄᴏsᴘʟᴀʏ
┃✮│➣ ${prefix}ᴅᴇɪᴅᴀʀᴀ
┃✮│➣ ${prefix}ᴅᴏʀᴀᴇᴍᴏɴ
┃✮│➣ ${prefix}ᴇʟᴀɪɴᴀ
┃✮│➣ ${prefix}ᴇᴍɪʟɪᴀ
┃✮│➣ ${prefix}ᴇʀᴢᴀ
┃✮│➣ ${prefix}ɢʀᴇᴍᴏʀʏ
┃✮│➣ ${prefix}ʜᴇsᴛɪᴀ
┃✮│➣ ${prefix}ʜᴜsʙᴜ
┃✮│➣ ${prefix}ɪɴᴏʀɪ
┃✮│➣ ${prefix}ɪsᴜᴢᴜ
┃✮│➣ ${prefix}ɪᴛᴀᴄʜɪ
┃✮│➣ ${prefix}ɪᴛᴏʀɪ
┃✮│➣ ${prefix}ᴋᴀɢᴀ
┃✮│➣ ${prefix}ᴋᴀɢᴜʀᴀ
┃✮│➣ ${prefix}ᴋᴀᴋᴀsʜɪ
┃✮│➣ ${prefix}ᴋᴀᴏʀɪ
┃✮│➣ ${prefix}ᴋᴇɴᴇᴋɪ
┃✮│➣ ${prefix}ᴋᴏᴛᴏʀɪ
┃✮│➣ ${prefix}ᴋᴜʀᴜᴍɪ
┃✮│➣ ${prefix}ʟᴏʟɪ
┃✮│➣ ${prefix}ᴍᴀᴅᴀʀᴀ
┃✮│➣ ${prefix}ᴍᴀɪᴅ
┃✮│➣ ${prefix}ᴍᴇɢᴜᴍɪɴ
┃✮│➣ ${prefix}ᴍɪᴋᴀsᴀ
┃✮│➣ ${prefix}ᴍɪᴋᴜ
┃✮│➣ ${prefix}ᴍɪɴᴀᴛᴏ
┃✮│➣ ${prefix}ɴᴀʀᴜᴛᴏ
┃✮│➣ ${prefix}ɴᴇᴋᴏɴɪᴍᴇ
┃✮│➣ ${prefix}ɴᴇᴢᴜᴋᴏ
┃✮│➣ ${prefix}ᴏɴᴇᴘɪᴇᴄᴇ
┃✮│➣ ${prefix}ʀɪᴢᴇ
┃✮│➣ ${prefix}sᴀɢɪʀɪ
┃✮│➣ ${prefix}sᴀᴋᴜʀᴀ
┃✮│➣ ${prefix}sᴀsᴜᴋᴇ
┃✮│➣ ${prefix}ᴛsᴜɴᴀᴅᴇ
┃✮│➣ ${prefix}ʏᴏᴛsᴜʙᴀ
┃✮│➣ ${prefix}ʏᴜᴋɪ
┃✮│➣ ${prefix}ʏᴜᴍᴇᴋᴏ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎨 sᴛɪᴄᴋᴇʀ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}s
┃✮│➣ ${prefix}sᴛɪᴄᴋᴇʀ
┃✮│➣ ${prefix}ᴛᴀᴋᴇ
┃✮│➣ ${prefix}sᴛᴇᴀʟ
┃✮│➣ ${prefix}ᴛᴏɪᴍɢ
┃✮│➣ ${prefix}ǫᴄ
┃✮│➣ ${prefix}ᴇᴍᴏᴊɪᴍɪx
┃✮│➣ ${prefix}sᴍᴇᴍᴇ
┃✮│➣ ${prefix}ᴘᴀᴛ
┃✮│➣ ${prefix}sʟᴀᴘ
┃✮│➣ ${prefix}ʜᴜɢ
┃✮│➣ ${prefix}ᴋɪss
┃✮│➣ ${prefix}ʙɪᴛᴇ
┃✮│➣ ${prefix}ʙʟᴜsʜ
┃✮│➣ ${prefix}ʙᴏɴᴋ
┃✮│➣ ${prefix}ʜɪɢʜꜰɪᴠᴇ
┃✮│➣ ${prefix}ʜᴀɴᴅʜᴏʟᴅ
┃✮│➣ ${prefix}ᴄᴜᴅᴅʟᴇ
┃✮│➣ ${prefix}ᴄʀʏ
┃✮│➣ ${prefix}ᴅᴀɴᴄᴇ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎤 ᴠᴏɪᴄᴇ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ʙᴀss
┃✮│➣ ${prefix}ʙʟᴏᴡɴ
┃✮│➣ ${prefix}ᴅᴇᴇᴘ
┃✮│➣ ${prefix}ᴇᴀʀʀᴀᴘᴇ
┃✮│➣ ${prefix}ꜰᴀsᴛ
┃✮│➣ ${prefix}ꜰᴀᴛ
┃✮│➣ ${prefix}ɴɪɢʜᴛᴄᴏʀᴇ
┃✮│➣ ${prefix}ʀᴇᴠᴇʀsᴇ
┃✮│➣ ${prefix}ʀᴏʙᴏᴛ
┃✮│➣ ${prefix}sʟᴏᴡ
┃✮│➣ ${prefix}sᴍᴏᴏᴛʜ
┃✮│➣ ${prefix}sǫᴜɪʀʀᴇʟ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 😊 ʀᴇᴀᴄᴛɪᴏɴ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ʟᴀᴜɢʜ
┃✮│➣ ${prefix}sʜʏ
┃✮│➣ ${prefix}sᴀᴅ
┃✮│➣ ${prefix}ᴍᴏᴏɴ
┃✮│➣ ${prefix}ᴀɴɢᴇʀ
┃✮│➣ ${prefix}ʜᴀᴘᴘʏ
┃✮│➣ ${prefix}ᴄᴏɴꜰᴜsᴇᴅ
┃✮│➣ ${prefix}ʜᴇᴀʀᴛ
┃✮│➣ ${prefix}ᴄᴏᴏʟ
┃✮│➣ ${prefix}ꜰɪʀᴇ
┃✮│➣ ${prefix}sᴛᴀʀ
┃✮│➣ ${prefix}ᴛʜᴜᴍʙsᴜᴘ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ✍️ ᴛᴇxᴛ ᴍᴀᴋᴇʀ ᴍᴇɴᴜ 〕━━┈⊷
┃
┃ 🎨 ʙᴀsɪᴄ
┃ ├ ${prefix}ᴛᴇxᴛɪᴍɢ
┃ ├ ${prefix}ᴛxᴛ2ɪᴍɢ
┃ ├ ${prefix}ᴛᴇxᴛ2ɪᴍɢ
┃ └ ${prefix}ᴀɪᴛᴇxᴛ
┃
┃ 🌟 ʟᴏɢᴏs
┃ ├ ${prefix}ʟᴏɢᴏ
┃ ├ ${prefix}ʟᴏɢᴏ2
┃ ├ ${prefix}ᴍᴀᴋᴇʟᴏɢᴏ2
┃ ├ ${prefix}ɢᴀᴍɪɴɢ
┃ ├ ${prefix}ɢᴀᴍɪɴɢʟᴏɢᴏ
┃ ├ ${prefix}ɢꜰx1
┃ ├ ${prefix}ɢꜰx2
┃ ├ ${prefix}ɢꜰx3
┃ ├ ${prefix}ɢꜰx4
┃ ├ ${prefix}ɢꜰx5
┃ ├ ${prefix}ɢꜰx6
┃ ├ ${prefix}ɢꜰx7
┃ ├ ${prefix}ɢꜰx8
┃ ├ ${prefix}ɢꜰx9
┃ ├ ${prefix}ɢꜰx10
┃ ├ ${prefix}ɢꜰx11
┃ ├ ${prefix}ɢꜰx12
┃ ├ ${prefix}ʙʀᴀᴛ
┃ └ ${prefix}ꜰᴜʀʙʀᴀᴛ
┃
┃ ⚡ ᴇꜰꜰᴇᴄᴛs
┃ ├ ${prefix}ɴᴇᴏɴ
┃ ├ ${prefix}ɴᴇᴏɴᴛᴇxᴛ
┃ ├ ${prefix}ɢʟɪᴛᴄʜ
┃ ├ ${prefix}ɢʟɪᴛᴄʜᴛᴇxᴛ
┃ ├ ${prefix}3ᴅᴛᴇxᴛ
┃ ├ ${prefix}ᴛᴇxᴛ3ᴅ
┃ ├ ${prefix}ᴄʜʀᴏᴍᴇ
┃ ├ ${prefix}ᴍᴇᴛᴀʟ
┃ ├ ${prefix}ʟᴜxᴜʀʏɢᴏʟᴅ
┃ ├ ${prefix}ɢᴏʟᴅᴛᴇxᴛ
┃ ├ ${prefix}ʀᴀɪɴʙᴏᴡ
┃ ├ ${prefix}ʀᴀɪɴʙᴏᴡᴛᴇxᴛ
┃ ├ ${prefix}ɢʀᴀᴅɪᴇɴᴛ
┃ ├ ${prefix}ɢʀᴀᴅɪᴇɴᴛᴛᴇxᴛ
┃ ├ ${prefix}ꜰɪʀᴇ
┃ ├ ${prefix}ꜰɪʀᴇᴛᴇxᴛ
┃ ├ ${prefix}ʟɪɢʜᴛɴɪɴɢ
┃ ├ ${prefix}ᴛʜᴜɴᴅᴇʀ
┃ ├ ${prefix}ᴡᴀᴛᴇʀ
┃ ├ ${prefix}ᴡᴀᴛᴇʀᴛᴇxᴛ
┃ ├ ${prefix}ɪᴄᴇ
┃ ├ ${prefix}ꜰʀᴏᴢᴇɴ
┃ ├ ${prefix}ɢᴀʟᴀxʏ
┃ ├ ${prefix}sᴘᴀᴄᴇ
┃ ├ ${prefix}ᴀɴɪᴍᴇ
┃ ├ ${prefix}ᴀɴɪᴍᴇᴛᴇxᴛ
┃ ├ ${prefix}ɢʀᴀꜰꜰɪᴛɪ
┃ ├ ${prefix}ɢʀᴀꜰꜰɪᴛɪᴛᴇxᴛ
┃ ├ ${prefix}ꜰʟᴏʀᴀʟ
┃ ├ ${prefix}ꜰʟᴏᴡᴇʀs
┃ ├ ${prefix}ʀᴇᴛʀᴏ
┃ ├ ${prefix}ʀᴇᴛʀᴏᴛᴇxᴛ
┃ ├ ${prefix}ʜᴏʀʀᴏʀ
┃ └ ${prefix}sᴄᴀʀʏ
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🖼️ ɪᴍᴀɢᴇ ᴍᴇɴᴜ 〕━━┈⊷
┃
┃ 🎤 ᴋ-ᴘᴏᴘ
┃ ├ ${prefix}ʙʟᴀᴄᴋᴘɪɴᴋ
┃ ├ ${prefix}ʀᴀɴᴅʙʟᴀᴄᴋᴘɪɴᴋ
┃ ├ ${prefix}ᴊᴇɴɴɪᴇ
┃ ├ ${prefix}ᴊɪsᴏᴏ
┃ ├ ${prefix}ᴊᴇɴɴɪᴇ1
┃ ├ ${prefix}ʀᴏsᴇᴇ
┃ ├ ${prefix}ʀᴏsᴇ
┃ ├ ${prefix}ʀʏᴜᴊɪɴ
┃ ├ ${prefix}ʙᴛs
┃ └ ${prefix}ᴇxᴏ
┃
┃ 🌸 ʀᴇᴀʟ ᴘᴇᴏᴘʟᴇ
┃ ├ ${prefix}ᴄᴇᴄᴀɴ
┃ ├ ${prefix}ᴄᴇᴡᴇᴋ
┃ ├ ${prefix}ᴄʜɪɴᴀ
┃ ├ ${prefix}ᴄʜɪɴᴇsᴇ
┃ ├ ${prefix}ʜɪᴊᴀʙ
┃ ├ ${prefix}ɪɴᴅᴏɴᴇsɪᴀ
┃ ├ ${prefix}ɪɴᴅᴏɴᴇsɪᴀɴ
┃ ├ ${prefix}ᴊᴀᴘᴀɴᴇsᴇ
┃ ├ ${prefix}ᴊᴀᴘᴀɴ
┃ ├ ${prefix}ᴋᴏʀᴇᴀɴ
┃ ├ ${prefix}ᴋᴏʀᴇᴀ
┃ ├ ${prefix}ᴍᴀʟᴀʏsɪᴀ
┃ ├ ${prefix}ᴍᴀʟᴀʏsɪᴀɴ
┃ ├ ${prefix}ᴛʜᴀɪʟᴀɴᴅ
┃ ├ ${prefix}ᴛʜᴀɪ
┃ ├ ${prefix}ᴠɪᴇᴛɴᴀᴍ
┃ └ ${prefix}ᴠɪᴇᴛɴᴀᴍᴇsᴇ
┃
┃ 🎨 ᴡᴀʟʟᴘᴀᴘᴇʀs
┃ ├ ${prefix}ᴄʏʙᴇʀ
┃ ├ ${prefix}ᴄʏʙᴇʀᴘᴜɴᴋ
┃ ├ ${prefix}ᴄʏʙᴇʀɢɪʀʟ
┃ ├ ${prefix}ʜᴀᴄᴋᴇʀ
┃ ├ ${prefix}ʜᴀᴄᴋᴇʀᴡᴀʟʟ
┃ ├ ${prefix}ᴛᴇᴄʜɴᴏʟᴏɢʏ
┃ ├ ${prefix}ᴛᴇᴄʜ
┃ ├ ${prefix}ᴍᴏᴜɴᴛᴀɪɴ
┃ ├ ${prefix}ᴍᴏᴜɴᴛᴀɪɴs
┃ ├ ${prefix}sᴘᴀᴄᴇ
┃ ├ ${prefix}sᴘᴀᴄᴇᴡᴀʟʟ
┃ ├ ${prefix}ɪsʟᴀᴍɪᴄ
┃ ├ ${prefix}ɪsʟᴀᴍɪᴄᴡᴀʟʟ
┃ ├ ${prefix}ǫᴜʀᴀɴ
┃ ├ ${prefix}ǫᴜʀᴀɴᴡᴀʟʟ
┃ ├ ${prefix}ғʀᴇᴇғɪʀᴇ
┃ ├ ${prefix}ғғ
┃ ├ ${prefix}ɢᴀᴍᴇᴡᴀʟʟᴘᴀᴘᴇʀ
┃ ├ ${prefix}ɢᴀᴍᴇᴡᴀʟʟ
┃ ├ ${prefix}ᴘᴜʙɢ
┃ ├ ${prefix}ᴘᴜʙɢᴡᴀʟʟ
┃ ├ ${prefix}ᴡᴀʟʟʜᴘ
┃ ├ ${prefix}ᴘʜᴏɴᴇᴡᴀʟʟᴘᴀᴘᴇʀ
┃ ├ ${prefix}ᴡᴀʟʟᴍʟ
┃ ├ ${prefix}ᴍᴏʙɪʟᴇʟᴇɢᴇɴᴅs
┃ ├ ${prefix}ᴡᴀʟʟᴍʟɴɪᴍᴇ
┃ └ ${prefix}ᴍʟɴɪᴍᴇ
┃
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 📱 ᴍɪsᴄ ᴍᴇɴᴜ 〕━━┈⊷
┃✮│➣ ${prefix}ʀᴇᴘᴏ
┃✮│➣ ${prefix}sᴄʀɪᴘᴛ
┃✮│➣ ${prefix}ᴛᴇsᴛ
┃✮│➣ ${prefix}sᴀᴠᴇ
┃✮│➣ ${prefix}ᴅᴏᴡɴʟᴏᴀᴅ
┃✮│➣ ${prefix}ᴀꜰᴋ
┃✮│➣ ${prefix}ʀᴇᴍɪɴᴅᴇʀ
┃✮│➣ ${prefix}sᴇᴛᴍᴏᴏᴅ
┃✮│➣ ${prefix}ᴍʏᴍᴏᴏᴅ
┃✮│➣ ${prefix}ᴡᴀʀᴍɢᴘᴛ
┃✮│➣ ${prefix}ᴠᴠ
┃✮│➣ ${prefix}ᴠᴠ2
┃✮│➣ ${prefix}ᴛɪᴋᴛᴏᴋsᴛᴀʟᴋ
┃✮│➣ ${prefix}ɪɢsᴛᴀʟᴋ
┃✮│➣ ${prefix}ꜰꜰsᴛᴀʟᴋ
┃✮│➣ ${prefix}ᴄʜᴇᴄᴋɪᴅᴄʜ
┃✮│➣ ${prefix}ʀᴇᴀᴄᴛᴄʜ
┃✮│➣ ${prefix}ꜰᴀᴋᴇʀᴇᴀᴄᴛ
┃✮│➣ ${prefix}ᴀᴜᴛᴏʀᴇᴀᴄᴛ
┃✮│➣ ${prefix}ᴇɴᴄ
╰━━━━━━━━━━━━━━━━━━━━━┈⊷

╭━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𓆩 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 💀 𓆪
╰━━━━━━━━━━━━━━━━━━━━━┈⊷`;

            // Send with newsletter style (exactly like bugmenu)
            await conn.sendMessage(from, {
                image: { url: menuImage },
                caption: menuText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: NEWSLETTER_JID,
                        newsletterName: NEWSLETTER_NAME,
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });

        } catch (err) {
            console.error("Menu error:", err);
            reply("❌ Failed to load menu.");
        }
    }
};