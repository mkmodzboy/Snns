const axios = require("axios");

module.exports = {
    pattern: "play",
    desc: "Search and download Spotify/YouTube tracks as playable audio",
    react: "🎧",
    category: "music",
    filename: __filename,

    execute: async (conn, mek, m, { from, args, q, reply }) => {
        // Helper function to send messages with contextInfo
        const sendMessageWithContext = async (text, quoted = mek) => {
            return await conn.sendMessage(from, {
                text: text,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363418906972955@newsletter",
                        newsletterName: "𝐐α͜͡𝐝εεɼ𝐗𝐓ε𝐜𝐡",
                        serverMessageId: 200
                    }
                }
            }, { quoted: quoted });
        };

        try {
            const query = q || args.join(" ");
            if (!query) {
                return await sendMessageWithContext(
`❎ Please provide a song name or link.

📌 Examples:
.play bado badi
.play https://open.spotify.com/track/2ksyzVfU0WJoBpu8otr4pz`);
            }

            // React 🎧
            if (module.exports.react) {
                await conn.sendMessage(from, { react: { text: module.exports.react, key: mek.key } });
            }

            let audioData = null;
            let apiUsed = null;

            // If direct Spotify link
            if (query.includes("spotify.com/track/")) {
                await sendMessageWithContext("🎶 Downloading track from Spotify... Please wait.");

                // Try PrinceTech API first
                try {
                    const api = `https://api.princetechn.com/api/download/spotifydl?apikey=prince&url=${encodeURIComponent(query)}`;
                    const { data } = await axios.get(api, { timeout: 20000 });

                    if (data?.result?.download_url) {
                        audioData = data.result;
                        apiUsed = "PrinceTech";
                    }
                } catch {}

                // Try David Cyril API if PrinceTech fails
                if (!audioData) {
                    try {
                        const api = `https://apis.davidcyriltech.my.id/spotifydl?url=${encodeURIComponent(query)}&apikey=`;
                        const { data } = await axios.get(api, { timeout: 20000 });

                        if (data?.success && data?.DownloadLink) {
                            audioData = {
                                download_url: data.DownloadLink,
                                title: data.title,
                                duration: data.duration,
                                thumbnail: data.thumbnail,
                                channel: data.channel
                            };
                            apiUsed = "David Cyril";
                        }
                    } catch {}
                }
            }

            // If search term or fallback for both APIs
            if (!audioData) {
                await sendMessageWithContext(`🔎 Searching for: *${query}* ...`);

                // Try PrinceTech search first
                try {
                    const api = `https://api.princetechn.com/api/search/spotifysearch?apikey=prince&query=${encodeURIComponent(query)}`;
                    const { data } = await axios.get(api, { timeout: 20000 });

                    if (data?.results?.length) {
                        const first = data.results[0];
                        const dlApi = `https://api.princetechn.com/api/download/spotifydl?apikey=prince&url=${encodeURIComponent(first.url)}`;
                        const { data: dlData } = await axios.get(dlApi, { timeout: 20000 });

                        if (dlData?.result?.download_url) {
                            audioData = dlData.result;
                            audioData.title = first.title || audioData.title;
                            audioData.channel = first.artist || audioData.channel;
                            audioData.duration = first.duration || audioData.duration;
                            audioData.thumbnail = first.thumbnail || audioData.thumbnail;
                            apiUsed = "PrinceTech";
                        }
                    }
                } catch {}

                // If PrinceTech search fails, try David Cyril API with search term
                if (!audioData) {
                    try {
                        // For search terms, we need to convert to a Spotify link first
                        // We'll use a search API to get a Spotify link, then use David Cyril's API
                        const searchApi = `https://api.princetechn.com/api/search/spotifysearch?apikey=prince&query=${encodeURIComponent(query)}`;
                        const { data: searchData } = await axios.get(searchApi, { timeout: 15000 });

                        if (searchData?.results?.length) {
                            const firstResult = searchData.results[0];
                            const spotifyUrl = firstResult.url;

                            // Now use David Cyril's API with the Spotify URL
                            const api = `https://apis.davidcyriltech.my.id/spotifydl?url=${encodeURIComponent(spotifyUrl)}&apikey=`;
                            const { data } = await axios.get(api, { timeout: 20000 });

                            if (data?.success && data?.DownloadLink) {
                                audioData = {
                                    download_url: data.DownloadLink,
                                    title: data.title || firstResult.title,
                                    duration: data.duration || firstResult.duration,
                                    thumbnail: data.thumbnail || firstResult.thumbnail,
                                    channel: data.channel || firstResult.artist
                                };
                                apiUsed = "David Cyril";
                            }
                        }
                    } catch {}
                }
            }

            if (!audioData) return await sendMessageWithContext("❌ Failed to fetch audio from all available sources.");

            const { download_url, title, duration, thumbnail, channel } = audioData;

            const caption = `🎵 *Track Info*\n\n` +
                            `📖 *Title:* ${title || "Unknown"}\n` +
                            `👤 *Artist/Channel:* ${channel || "Unknown"}\n` +
                            `⏱️ *Duration:* ${duration || "Unknown"}\n` +
                            `🌐 *Source:* ${apiUsed || "API"}\n\n` +
                            `> _ᴘᴏᴡᴇʀᴇᴅ ʙʏ ϙᴀᴅᴇᴇʀ-xᴅ - ᴍɪɴɪ_`;

            let thumbBuffer;
            if (thumbnail) {
                try {
                    const res = await axios.get(thumbnail, { responseType: "arraybuffer", timeout: 10000 });
                    thumbBuffer = Buffer.from(res.data);
                } catch {
                    thumbBuffer = null;
                }
            }

            await conn.sendMessage(from, {
                audio: { url: download_url },
                mimetype: "audio/mpeg",
                fileName: `${(title || "audio").replace(/[^\w\s]/gi, '')}.mp3`,
                caption: caption,
                jpegThumbnail: thumbBuffer,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363418906972955@newsletter",
                        newsletterName: "𝐐α͜͡𝐝εεɼ𝐗𝐓ε𝐜𝐡",
                        serverMessageId: 200
                    }
                }
            }, { quoted: mek });

        } catch (e) {
            console.error("❌ Play Command Error:", e.response?.data || e.message);
            await sendMessageWithContext(`⚠️ Error: ${e.message}`);
        }
    }
};