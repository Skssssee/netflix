const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { CustomFile } = require('telegram/client/uploads');

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const defaultChannelId = process.env.TELEGRAM_CHANNEL_ID;

const stringSession = new StringSession('');
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

const { NewMessage } = require('telegram/events');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const Channel = require('../models/Channel');

// ─── Normalize a channel ID to bare digits (no -100 prefix) ─────────────────
function bareId(id) {
  return id?.toString?.().replace(/^-100/, '').replace(/n$/, '').trim() || '';
}

// ─── Resolve category name for an incoming message ───────────────────────────
async function resolveCategoryName(message) {
  // Always fetch fresh channels from DB (picks up new channels without restart)
  const dbChannels = await Channel.find({ active: true });

  const peerBare = bareId(message.peerId?.channelId || message.peerId?.chatId);
  const fwdBare  = message.fwdFrom?.fromId?.className === 'PeerChannel'
    ? bareId(message.fwdFrom.fromId.channelId)
    : null;

  console.log(`[Auto-Save] peerId bare=${peerBare}, fwdFrom bare=${fwdBare}`);

  // 1. Check destination channel (peerId) against DB — most reliable
  for (const rc of dbChannels) {
    if (bareId(rc.channelId) === peerBare) {
      console.log(`[Auto-Save] ✅ Matched peerId to DB channel: ${rc.name}`);
      return { categoryName: rc.name, sourceChannelId: '-100' + peerBare };
    }
  }

  // 2. Check forwarded-from channel against DB
  if (fwdBare) {
    for (const rc of dbChannels) {
      if (bareId(rc.channelId) === fwdBare) {
        console.log(`[Auto-Save] ✅ Matched fwdFrom to DB channel: ${rc.name}`);
        return { categoryName: rc.name, sourceChannelId: '-100' + fwdBare };
      }
    }
    // Try Telegram API for non-private channels
    try {
      const entity = await client.getEntity(BigInt('-100' + fwdBare));
      if (entity?.title) {
        return { categoryName: entity.title, sourceChannelId: '-100' + fwdBare };
      }
    } catch (e) { /* private channel – can't resolve */ }
  }

  // 3. Get destination channel name from Telegram API
  if (peerBare) {
    try {
      const entity = await client.getEntity(BigInt('-100' + peerBare));
      if (entity?.title) return { categoryName: entity.title, sourceChannelId: '-100' + peerBare };
    } catch (e) { /* silent */ }
  }

  // 4. Env default channel
  try {
    const entity = await client.getEntity(defaultChannelId);
    if (entity?.title) return { categoryName: entity.title, sourceChannelId: defaultChannelId };
  } catch (e) { /* silent */ }

  return { categoryName: 'Uncategorized', sourceChannelId: '' };
}

// ─── Build the combined list of all channel IDs to listen on ─────────────────
async function getAllChannelIds() {
  const dbChannels = await Channel.find({ active: true });
  const ids = dbChannels.map(c => c.channelId);
  if (defaultChannelId && !ids.includes(defaultChannelId)) ids.push(defaultChannelId);
  return { ids, channels: dbChannels };
}

function cleanTitleForSEO(title, categoryName) {
  if (!title) return 'Untitled Video';
  let clean = title.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm|3gp)$/i, '');
  clean = clean.replace(/[\._\-]/g, ' ');
  
  // Strip parentheses and brackets containing release details
  clean = clean.replace(/\[[^\]]*(dual|audio|esub|multi|sub|dub|hindi|english|web|h\-)[^\]]*\]/gi, '');
  clean = clean.replace(/\([^\)]*(dual|audio|esub|multi|sub|dub|hindi|english|web|h\-)[^\)]*\)/gi, '');
  
  // Strip standalone common keywords
  clean = clean.replace(/\b(esubs?|dual[- ]audio|multi[- ]audio|dubbed|video[- ]file|hindi|english|org|original|web[- ]?rip|bluray|clean|org[- ]dual|dual|audio|hdts|camrip|telesync|cam|ts)\b/gi, '');
  
  // Remove remaining brackets/parentheses, colons, hyphens
  clean = clean.replace(/[\(\)\[\]\{\}\-\:]/g, ' ');
  
  const ripTags = [
    /\b\d{3,4}p\b/gi,
    /\bx26[45]\b/gi,
    /\bh26[45]\b/gi,
    /\bhevc\b/gi,
    /\bweb[- ]?dl\b/gi,
    /\bweb[- ]?rip\b/gi,
    /\bhd[- ]?rip\b/gi,
    /\bvd[- ]?rip\b/gi,
    /\bbluray\b/gi,
    /\bbrrip\b/gi,
    /\bdvd\b/gi,
    /\bdvdrip\b/gi,
    /\b[12]\d{3}\b/gi,
    /\bhdts\b/gi,
    /\bhd-ts\b/gi,
    /\bcamrip\b/gi,
    /\btelesync\b/gi,
    /\bts\b/gi
  ];
  ripTags.forEach(regex => {
    clean = clean.replace(regex, '');
  });
  
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // Strip trailing short word artifacts (like "Or", "H", "Org", "And") from the end of the title
  clean = clean.replace(/\s+\b[a-zA-Z]{1,3}\b\s*$/g, '').trim();

  clean = clean.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    
  if (categoryName && !['Uncategorized', 'Video file', 'Video', 'Videos'].includes(categoryName)) {
    const cleanCat = categoryName.replace(/Videos|Clips|Stories|Highlights/gi, '').trim();
    if (clean && !clean.toLowerCase().includes(cleanCat.toLowerCase())) {
      clean = `${clean} - ${categoryName}`;
    }
  }
  return clean;
}

// ─── Core message handler ─────────────────────────────────────────────────────
async function handleMessage(event) {
  const message = event.message;
  if (!message.media?.document) return;

  const caption = message.message || '';
  const titleMatch       = caption.match(/Title:\s*(.+)/i);
  const imageMatch       = caption.match(/Image:\s*(.+)/i);
  const categoryMatch    = caption.match(/Category:\s*(.+)/i);
  const durationMatch    = caption.match(/Duration:\s*(.+)/i);
  const descriptionMatch = caption.match(/Description:\s*([\s\S]+)/i);

  let title, imageUrl, categoryName, duration, description, sourceChannelId = '';

  if (titleMatch && imageMatch && categoryMatch && durationMatch && descriptionMatch) {
    title         = titleMatch[1].trim();
    imageUrl      = imageMatch[1].trim();
    categoryName  = categoryMatch[1].trim();
    duration      = durationMatch[1].trim();
    description   = descriptionMatch[1].trim();
  } else {
    title       = 'Untitled Video';
    duration    = '0m';
    description = caption || 'No description provided.';

    if (message.media.document.attributes) {
      for (const attr of message.media.document.attributes) {
        if (attr.className === 'DocumentAttributeFilename' && attr.fileName)
          title = attr.fileName.replace(/\.[^/.]+$/, '');
        if (attr.className === 'DocumentAttributeVideo' && attr.duration)
          duration = Math.floor(attr.duration / 60) + 'm ' + Math.round(attr.duration % 60) + 's';
      }
    }

    imageUrl = `http://localhost:5001/api/public/thumb/${message.id}`;
    const resolved = await resolveCategoryName(message);
    categoryName    = resolved.categoryName;
    sourceChannelId = resolved.sourceChannelId;
  }

  const telegramFileId = message.id.toString();

  try {
    let category = await Category.findOne({
      name: new RegExp('^' + categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')
    });
    if (!category) {
      category = new Category({
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      await category.save();
    }
    const cleanedTitle = cleanTitleForSEO(title, category.name);
    const movie = new Movie({
      title: cleanedTitle, description, thumbnailUrl: imageUrl,
      telegramFileId, category: category._id, duration, sourceChannelId
    });
    await movie.save();
    console.log(`[Auto-Save] ✅ "${cleanedTitle}" → "${category.name}" (src: ${sourceChannelId || 'direct'})`);
  } catch (err) {
    console.error('[Auto-Save] Error saving to DB:', err.message);
  }
}


// ─── Initialize Telegram client and register listeners ────────────────────────
(async () => {
  try {
    await client.start({ botAuthToken: botToken });
    console.log('Telegram MTProto Client connected successfully via Bot Token');

    const { ids: channelIds } = await getAllChannelIds();
    console.log(`[Auto-Save] Listening on ${channelIds.length} channel(s): ${channelIds.join(', ')}`);

    client.addEventHandler(
      (event) => handleMessage(event),
      new NewMessage({ chats: channelIds })
    );

  } catch (error) {
    console.error('Error connecting Telegram Client:', error);
  }
})();



const fs = require('fs');
const path = require('path');
const bigInt = require('big-integer');

const cacheDir = path.join(__dirname, '../video_cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const messageCache = new Map();
const activeDownloads = new Set();

function triggerBackgroundDownload(messageId, message) {
  const document = message.media?.document;
  if (!document) return;
  
  const fileSize = Number(document.size);
  if (fileSize > 150 * 1024 * 1024) {
    console.log(`[Cache Download] Skipping background cache for ${messageId} due to large size (${(fileSize / (1024*1024)).toFixed(1)} MB)`);
    return;
  }

  const cacheFilePath = path.join(cacheDir, `${messageId}.mp4`);
  if (activeDownloads.has(messageId) || fs.existsSync(cacheFilePath)) {
    return;
  }
  
  activeDownloads.add(messageId);
  console.log(`[Cache Download] Starting background download for ${messageId}.mp4 (${(fileSize / (1024*1024)).toFixed(1)} MB)`);
  
  const writeStream = fs.createWriteStream(cacheFilePath + '.tmp');
  
  (async () => {
    try {
      for await (const chunk of client.iterDownload({
        file: message.media,
        requestSize: 2 * 1024 * 1024, // 2MB chunks for speed
      })) {
        writeStream.write(chunk);
      }
      writeStream.end();
      
      fs.renameSync(cacheFilePath + '.tmp', cacheFilePath);
      console.log(`[Cache Download] Successfully cached ${messageId}.mp4 to disk`);
    } catch (err) {
      console.error(`[Cache Download] Failed for ${messageId}.mp4:`, err);
      try {
        writeStream.destroy();
        if (fs.existsSync(cacheFilePath + '.tmp')) {
          fs.unlinkSync(cacheFilePath + '.tmp');
        }
      } catch (e) {}
    } finally {
      activeDownloads.delete(messageId);
    }
  })();
}

// Helper: fetch a message by ID by trying all registered channels
async function getMessageFromAnyChannel(messageId) {
  if (messageCache.has(messageId)) {
    return messageCache.get(messageId);
  }
  const { ids: allChannelIds } = await getAllChannelIds();
  for (const chId of allChannelIds) {
    try {
      const messages = await client.getMessages(chId, { ids: [messageId] });
      if (messages && messages[0] && messages[0].media) {
        messageCache.set(messageId, messages[0]);
        return messages[0];
      }
    } catch (e) { /* try next channel */ }
  }
  return null;
}

exports.streamVideo = async (req, res) => {
  try {
    const { telegramFileId } = req.params;
    const messageId = parseInt(telegramFileId, 10);

    // 1. Check if video is cached on local disk
    const cacheFilePath = path.join(cacheDir, `${messageId}.mp4`);
    if (fs.existsSync(cacheFilePath)) {
      console.log(`[Cache Hit] Streaming ${messageId}.mp4 directly from disk cache`);
      const stat = fs.statSync(cacheFilePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });
        
        fs.createReadStream(cacheFilePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(cacheFilePath).pipe(res);
      }
      return;
    }

    // 2. Fallback to fetching remotely from Telegram
    const message = await getMessageFromAnyChannel(messageId);
    if (!message || !message.media) {
      return res.status(404).send('Video not found or message has no media');
    }

    const document = message.media.document;
    if (!document) {
        return res.status(404).send('No document in message media');
    }

    const fileSize = Number(document.size);
    const range = req.headers.range;

    // Trigger background download to cache the file for future plays
    triggerBackgroundDownload(messageId, message);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      // Align start offset to nearest 512KB block boundary (divisible by 524288) to satisfy Telegram requirements
      const ALIGNMENT = 512 * 1024;
      const alignedStart = Math.floor(start / ALIGNMENT) * ALIGNMENT;
      const skipBytes = start - alignedStart;

      // Iteratively download chunks and stream to response
      let bytesSent = 0;
      let skipped = 0;
      for await (const chunk of client.iterDownload({
        file: message.media,
        offset: bigInt(alignedStart),
        requestSize: 1024 * 1024, // 1MB chunks
      })) {
        let processedChunk = chunk;
        if (skipped < skipBytes) {
          const neededToSkip = skipBytes - skipped;
          if (chunk.length <= neededToSkip) {
            skipped += chunk.length;
            continue; // Skip this chunk entirely
          } else {
            processedChunk = chunk.slice(neededToSkip);
            skipped = skipBytes;
          }
        }

        const remaining = chunkSize - bytesSent;
        if (processedChunk.length <= remaining) {
          res.write(processedChunk);
          bytesSent += processedChunk.length;
        } else {
          res.write(processedChunk.slice(0, remaining));
          bytesSent += remaining;
        }
        
        if (bytesSent >= chunkSize) {
          break;
        }
      }
      res.end();
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });

      for await (const chunk of client.iterDownload({
        file: message.media,
        requestSize: 1024 * 1024, // 1MB chunks
      })) {
        res.write(chunk);
      }
      res.end();
    }
  } catch (error) {
    console.error('Streaming error:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error while streaming video');
    } else {
      res.end();
    }
  }
};

exports.getThumbnail = async (req, res) => {
  try {
    const { telegramFileId } = req.params;
    const messageId = parseInt(telegramFileId, 10);

    const message = await getMessageFromAnyChannel(messageId);

    if (!message || !message.media) {
      return res.redirect('https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1974&auto=format&fit=crop');
    }

    // Try multiple thumb indexes: -1 (highest quality), 0, 1
    const thumbIndexes = [-1, 0, 1, 2];
    let thumbBuffer = null;

    for (const thumbIndex of thumbIndexes) {
      try {
        const thumbPromise = client.downloadMedia(message.media, { thumb: thumbIndex });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        const buf = await Promise.race([thumbPromise, timeoutPromise]);

        if (buf && buf.length > 0) {
          // Check JPEG magic bytes (FFD8FF) — real images start with this
          const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
          // Check PNG magic bytes (89504E47)
          const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;

          if (isJpeg || isPng) {
            thumbBuffer = buf;
            console.log(`[Thumb API] Got valid ${isJpeg ? 'JPEG' : 'PNG'} thumbnail (${buf.length} bytes) at index ${thumbIndex} for msg ${messageId}`);
            break; // Found a real image, stop trying
          } else {
            console.log(`[Thumb API] Index ${thumbIndex} returned non-image data (${buf.length} bytes), trying next...`);
          }
        }
      } catch (e) {
        console.log(`[Thumb API] Index ${thumbIndex} failed: ${e.message}`);
      }
    }

    if (thumbBuffer) {
      const contentType = thumbBuffer[0] === 0x89 ? 'image/png' : 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(thumbBuffer);
    }

    // All attempts failed — serve placeholder
    res.redirect('https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1974&auto=format&fit=crop');
  } catch (error) {
    console.error('Thumbnail API error:', error.message);
    res.redirect('https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1974&auto=format&fit=crop');
  }
};
