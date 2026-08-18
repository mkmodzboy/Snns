const { setAntiDel, isAntiDel } = require("../antidelSystem");

module.exports = {
    pattern: "antidel",

    execute: async (conn, message, m, { reply, from }) => {

        const status = isAntiDel(from);

        setAntiDel(from, !status);

        return reply(
            !status
                ? "✅ Anti-Delete ON\nAb deleted messages automatically recover hongi."
                : "❌ Anti-Delete OFF"
        );
    }
};