const TelegramBot = require('node-telegram-bot-api');
const { doc, getDocs, updateDoc, collection, query, where } = require('firebase/firestore');

function initTelegramBot(db) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8995592600:AAHO69c3MT29W-sJP3_8kpzDQ2NAC2cc2Zg';
  let bot = null;

  try {
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
      bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
      
      bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text ? msg.text.trim() : '';

        if (text.startsWith('/start')) {
          bot.sendMessage(chatId, "Welcome to Soniexchange Security Bot! To connect your account, type /connect YOUR_CODE");
        } else if (text.startsWith('/connect')) {
          const parts = text.split(' ');
          if (parts.length < 2) {
            bot.sendMessage(chatId, "Please provide your connection code e.g. /connect 5DAB79F3");
            return;
          }
          const connCode = parts[1].toUpperCase();

          try {
            const q = query(collection(db, "users"), where("telegramCode", "==", connCode));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
              bot.sendMessage(chatId, "Invalid or expired connection code! Please generate a new code from your website secure auth settings.");
            } else {
              let targetDocId = null;
              querySnapshot.forEach((d) => { targetDocId = d.id; });

              if (targetDocId) {
                const userRef = doc(db, 'users', targetDocId);
                await updateDoc(userRef, {
                  telegramChatId: chatId.toString(),
                  telegramEnabled: true,
                  telegramCode: null
                });
                bot.sendMessage(chatId, `Success! Your account (${targetDocId}) is now successfully linked with Telegram. 2FA is enabled.`);
              }
            }
          } catch (err) {
            console.error("Telegram connection error:", err);
            bot.sendMessage(chatId, "An error occurred while linking your account. Please try again.");
          }
        }
      });
    }
  } catch (e) {
    console.log("Telegram Bot initialization notice:", e.message);
  }

  return bot;
}

module.exports = { initTelegramBot };

