// plugins/img.js
const axios = require("axios");

module.exports = {
  pattern: "img",
  desc: "Search and download images",
  react: "🦋",
  category: "fun",
  filename: __filename,
  use: ".img <keywords>",

  execute: async (conn, message, m, { args, from }) => {
    const sendMessageWithContext = async (text, quoted = message) => {
      return conn.sendMessage(
        from,
        {
          text,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363418906972955@newsletter",
              newsletterName: "𝐐α͜͡𝐝εεɼ𝐗𝐓ε𝐜𝐡",
              serverMessageId: 200,
            },
          },
        },
        { quoted }
      );
    };

    try {
      const query = args.join(" ").trim();
      if (!query) {
        return await sendMessageWithContext(
          "❌ Please provide a search query\nExample: .img cute cats"
        );
      }

      // 1) React
      if (module.exports.react) {
        try {
          await conn.sendMessage(from, {
            react: { text: module.exports.react, key: message.key },
          });
        } catch {}
      }

      await sendMessageWithContext(`🔍 Searching images for "${query}"...`);

      // 2) API endpoints
      const apiEndpoints = [
        `https://api-toxxic.zone.id/api/search/unsplash?q=${encodeURIComponent(query)}`,
        `https://api-toxxic.zone.id/api/search/wallpaper?q=${encodeURIComponent(query)}`
      ];

      let response = null;
      let lastError = null;

      // Try endpoints until some data is returned
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`[img] Trying endpoint: ${endpoint}`);
          const r = await axios.get(endpoint, { timeout: 10000 });
          if (r && r.data) {
            response = r;
            console.log("[img] Got response from endpoint");
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`[img] Endpoint failed: ${endpoint} -> ${err.message}`);
        }
      }

      if (!response || !response.data) {
        console.error("[img] All image APIs failed:", lastError && lastError.message);
        return await sendMessageWithContext(
          "❌ All image services are currently unavailable. Please try again later."
        );
      }

      // 3) Extract image URLs from response
      function extractArray(obj) {
        if (!obj) return [];
        if (Array.isArray(obj)) return obj;
        const candidates = ["result", "data", "imageUrls", "images", "photos", "hits", "results"];
        for (const c of candidates) {
          if (Array.isArray(obj[c]) && obj[c].length) return obj[c];
        }
        for (const k of Object.keys(obj)) {
          if (Array.isArray(obj[k]) && obj[k].length) return obj[k];
        }
        return [];
      }

      function urlFromItem(item) {
        if (!item) return null;
        if (typeof item === "string") return item;
        const tryFields = [
          "url", "image", "original", "src", "link", "download_url", "display_url",
          "previewURL", "largeImageURL", "photo", "photoUrl", "path"
        ];
        if (item.urls) {
          if (item.urls.full) return item.urls.full;
          if (item.urls.regular) return item.urls.regular;
          if (item.urls.small) return item.urls.small;
          if (item.urls.raw) return item.urls.raw;
        }
        if (item.src) {
          if (typeof item.src === "string") return item.src;
          if (item.src.original) return item.src.original;
          if (item.src.large) return item.src.large;
          if (item.src.medium) return item.src.medium;
        }
        for (const f of tryFields) {
          if (item[f]) {
            if (typeof item[f] === "string") return item[f];
            if (item[f].url && typeof item[f].url === "string") return item[f].url;
          }
        }
        if (item.image && typeof item.image === "object") {
          if (item.image.url) return item.image.url;
        }
        return null;
      }

      let items = extractArray(response.data);
      if ((!items || items.length === 0) && typeof response.data === "object") {
        items = extractArray(response.data.data || response.data.result || response.data);
      }
      if (!items || items.length === 0) {
        if (response.data && typeof response.data === "object" && urlFromItem(response.data)) {
          items = [response.data];
        }
      }

      const urls = [];
      for (const it of items) {
        const u = urlFromItem(it);
        if (u && typeof u === "string") urls.push(u);
      }

      if (urls.length === 0 && Array.isArray(response.data.imageUrls)) {
        for (const u of response.data.imageUrls) if (typeof u === "string") urls.push(u);
      }

      const validUrls = [...new Set(urls.map(u => (u || "").trim()).filter(u => /^https?:\/\//i.test(u)))];

      if (!validUrls.length) {
        console.warn("[img] No valid image URLs extracted from response");
        return await sendMessageWithContext(
          "❌ No images found. Try different keywords."
        );
      }

      // 4) Choose up to 5 random images
      const limit = 5;
      const selected = validUrls.sort(() => 0.5 - Math.random()).slice(0, limit);

      let sentCount = 0;
      for (const imageUrl of selected) {
        try {
          const imageResp = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
          const buffer = Buffer.from(imageResp.data);

          await conn.sendMessage(
            from,
            {
              image: buffer,
              caption: `📷 Result for: ${query}\n> © *_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ϙᴀᴅᴇᴇʀ-xᴅ - ᴍɪɴɪ_*`
            },
            { quoted: message }
          );

          sentCount++;
          await new Promise(res => setTimeout(res, 1000));
        } catch (imgErr) {
          console.warn(`[img] Failed to download/send image: ${imageUrl} -> ${imgErr.message}`);
          continue;
        }
      }

      if (sentCount === 0) {
        return await sendMessageWithContext(
          "❌ Failed to download/send any images. Try again later."
        );
      }

    } catch (err) {
      console.error("Image search error:", err);
      await sendMessageWithContext(
        `⚠️ Error: ${err.message || "Failed to fetch images"}`
      );
    }
  },
};