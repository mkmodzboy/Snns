// === commands/siminfo.js ===
const axios = require('axios');

module.exports = {
    pattern: "siminfo",
    desc: "Get SIM information by mobile number",
    category: "tools",
    filename: __filename,
    use: ".siminfo 923xxxxxxxxx",

    execute: async (conn, message, m, { from, reply, args, q }) => {
        try {
            let targetNum = q ? q.replace(/[^0-9]/g, '') : '';
            
            if (!targetNum || targetNum.length < 10) {
                return reply('❌ Provide a valid mobile number');
            }

            if (targetNum.startsWith('0')) {
                targetNum = '92' + targetNum.slice(1);
            }

            const res = await axios.get(`https://sychosimdatabase.vercel.app/api/lookup/${targetNum}`, { timeout: 60000 });
            const data = res.data;

            if (!data.success || !data.results || data.results.length === 0) {
                return reply('❌ Data not found from NADRA');
            }

            let txt = `📡 *SIM INFORMATION*\n\n`;

            data.results.forEach((r, i) => {
                txt += `*Record #${i+1}*\n📱: ${r.mobile}\n👤: ${r.name}\n🆔: ${r.cnic}\n🏠: ${r.address}\n\n`;
            });

            txt += `\n> 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 💀`;

            await reply(txt);

        } catch (e) {
            console.error("SIM info error:", e);
            reply('❌ Data not found from NADRA');
        }
    }
};