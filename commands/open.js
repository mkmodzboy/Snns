// === open.js ===
module.exports = {
  pattern: "open",
  desc: "Open the group (Admins Only)",
  category: "group",
  react: "🔓",
  filename: __filename,
  use: ".open",

  execute: async (conn, message, m, { from, isGroup, reply, sender }) => {
    try {
      if (!isGroup) return reply("❌ This command can only be used in groups.");

      let metadata;
      try {
        metadata = await conn.groupMetadata(from);
      } catch {
        return reply("❌ Failed to get group info.");
      }

      const participant = metadata.participants.find(p => p.id === sender);
      const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
      const isOwner = conn.user.id.split(":")[0] === sender.split("@")[0];
      if (!isAdmin && !isOwner) return reply("❌ Only admins can use this command.");

      // React success
      await conn.sendMessage(from, { react: { text: "✅", key: message.key } });

      // Open the group for all members with contextInfo
      await conn.groupSettingUpdate(from, "not_announcement");
      await conn.sendMessage(from, {
        text: "🔓 Group is now open. All members can send messages.",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363418906972955@newsletter",
            newsletterName: "𝐐α͜͡𝐝εεɼ𝐗𝐓ε𝐜𝐡",
            serverMessageId: 200
          }
        }
      }, { quoted: message });

    } catch (e) {
      console.error("Open error:", e);

      // React fail
      await conn.sendMessage(from, { react: { text: "❌", key: message.key } });

      // Error with contextInfo
      reply("⚠️ Failed to open the group.", {
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363418906972955@newsletter",
            newsletterName: "𝐐α͜͡𝐝εεɼ𝐗𝐓ε𝐜𝐡",
            serverMessageId: 200
          }
        }
      });
    }
  }
};
