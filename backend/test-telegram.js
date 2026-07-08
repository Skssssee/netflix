require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

const client = new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 5 });

async function run() {
  await client.start({ botAuthToken: botToken });
  const messages = await client.getMessages(channelId, { ids: [40] });
  const message = messages[0];
  console.log("FWD FROM:", JSON.stringify(message.fwdFrom, null, 2));
  
  if (message.fwdFrom && message.fwdFrom.fromId) {
     const entity = await client.getEntity(message.fwdFrom.fromId);
     console.log("ENTITY:", entity.className, entity.title, entity.firstName);
  }
  
  // Test download
  console.log("Testing iterDownload for 1 chunk...");
  let chunkCount = 0;
  try {
    for await (const chunk of client.iterDownload({
        file: message.media,
        requestSize: 1024 * 1024,
        limit: 1024 * 1024,
    })) {
        console.log("Received chunk size:", chunk.length);
        chunkCount++;
        break; // just test one
    }
    console.log("Download test complete. Chunks:", chunkCount);
  } catch (e) {
    console.error("iterDownload error:", e);
  }
  process.exit(0);
}
run();
