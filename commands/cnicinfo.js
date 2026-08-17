// === commands/cnicinfo.js ===
const axios = require('axios');

module.exports = {
    pattern: "cnicinfo",
    desc: "Get CNIC information by CNIC number",
    category: "tools",
    filename: __filename,
    use: ".cnicinfo 1234567890123",

    execute: async (conn, message, m, { from, reply, args, q }) => {
        try {
            let targetCnic = q ? q.replace(/[^0-9]/g, '') : '';
            
            if (!targetCnic || targetCnic.length < 13) {
                return reply('❌ Provide a valid 13 digit CNIC');
            }

            const res = await axios.get(`https://sychosimdatabase.vercel.app/api/lookup/${targetCnic}`, { timeout: 60000 });
            const data = res.data;

            if (!data.success || !data.results || data.results.length === 0) {
                return reply('❌ Data not found from NADRA');
            }

            let txt = `🆔 *CNIC INFORMATION*\n\n`;

            data.results.forEach((r, i) => {
                txt += `*Record #${i+1}*\n📱: ${r.mobile}\n👤: ${r.name}\n🆔: ${r.cnic}\n🏠: ${r.address}\n\n`;
            });

            txt += `\n> 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓 💀`;

            await reply(txt);

        } catch (e) {
            console.error("CNIC info error:", e);
            reply('❌ Data not found from NADRA');
        }
    }
};