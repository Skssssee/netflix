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
  const messages = await client.getMessages(channelId, { limit: 2 });
  for (const message of messages) {
      if (message.media && message.media.document) {
          console.log("Thumbs for msg", message.id, ":");
          if (message.media.document.thumbs) {
              message.media.document.thumbs.forEach(t => {
                  console.log(t.className, "bytes length:", t.bytes ? t.bytes.length : 'none');
                  if (t.className === 'PhotoStrippedSize' && t.bytes) {
                      console.log("Inline thumb found!");
                  }
              });
          }
      }
  }
  process.exit(0);
}
run();
