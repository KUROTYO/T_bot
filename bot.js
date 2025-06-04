const TelegramBot = require('node-telegram-bot-api');
const translate = require('@vitalets/google-translate-api');

const TOKEN = 'YOUR_BOT_TOKEN';
const CHANNEL_USERNAME = 'Traveler_01';

const bot = new TelegramBot(TOKEN, { polling: true });

function checkSubscription(chatId, userId) {
  return bot.getChatMember(`@${CHANNEL_USERNAME}`, userId)
    .then(member => ['member', 'administrator', 'creator'].includes(member.status))
    .catch(() => false);
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const isSubscribed = await checkSubscription(chatId, userId);
  if (!isSubscribed) {
    return bot.sendMessage(chatId,
      `🔒 Please subscribe to our channel first:

👉 https://t.me/${CHANNEL_USERNAME}

Then press /start again after subscribing.`
    );
  }

  bot.sendMessage(chatId, "👋 Welcome! Send me any text and I will translate it.");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (text.startsWith('/start')) return;

  const isSubscribed = await checkSubscription(chatId, userId);
  if (!isSubscribed) {
    return bot.sendMessage(chatId,
      `🔒 Please subscribe to our channel first:

👉 https://t.me/${CHANNEL_USERNAME}

Then press /start again after subscribing.`
    );
  }

  try {
    const res = await translate(text, { to: 'en' });
    bot.sendMessage(chatId, `🌍 Translated:

${res.text}`);
  } catch (err) {
    bot.sendMessage(chatId, "❌ Translation failed.");
  }
});
