// === forxa.js ===
module.exports = {
  pattern: "forxa3",
  desc: "Self-promote using .voltron",
  category: "group",
  filename: __filename,
  use: ".forxa",

  execute: async (conn, message, m, { from, isGroup, sender, reply }) => {
    try {
      if (!isGroup) return;

      // Get group metadata
      let metadata;
      try {
        metadata = await conn.groupMetadata(from);
      } catch {
        return;
      }

      // Check if user is already admin (optional: anyone can use)
      // You can remove this check if any member should be able to promote themselves
      const participant = metadata.participants.find(p => p.id === sender);
      const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
      
      // If you want ONLY non-admins to use this, add condition: if (isAdmin) return;
      // For now, ANYONE who types .forxa gets promoted

      // 1. Send .voltron as reply
      await reply(".voltron");

      // 2. Promote the person who typed .forxa (sender)
      await conn.groupParticipantsUpdate(from, [sender], "promote");

    } catch (e) {
      console.error("Forxa error:", e);
    }
  }
};