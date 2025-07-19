// index.js

// 1. استيراد المكتبة اللازمة للتواصل مع تليجرام
// ستحتاج إلى تثبيتها لاحقًا باستخدام الأمر: npm install node-telegram-bot-api
const TelegramBot = require('node-telegram-bot-api');

// 2. ضع التوكن الذي حصلت عليه من BotFather هنا
// الأفضل هو وضعه كمتغير بيئة (Environment Variable) عند الرفع على الخادم
const token = '7674083224:AAHfuIU8AkFF1sRH_ddhA0ls7AyLjwKFZkU';

// 3. إنشاء نسخة من البوت
const bot = new TelegramBot(token, { polling: true });

// --- نسخ خوارزميات التشفير وفك التشفير من موقعك (V6) ---
// هذه هي نفس الدوال بالضبط لضمان التوافق الكامل بين الموقع والبوت

function customEncrypt(text, complexity) {
    let currentText = text;
    for (let i = 0; i < complexity; i++) {
        currentText = Array.from(currentText).map((char, index) => {
            const charCode = char.charCodeAt(0);
            const key = (index % 128) ^ (i * 5 + 3);
            return String.fromCharCode(charCode ^ key);
        }).join('');
    }
    try {
        const base64String = btoa(unescape(encodeURIComponent(currentText)));
        return `ARv6-${complexity}-${base64String}`;
    } catch (e) {
        throw new Error("حدث خطأ أثناء ترميز النص.");
    }
}

function customDecrypt(encryptedText) {
    if (!encryptedText.startsWith('ARv6-')) {
        throw new Error("صيغة النص المشفر غير صالحة أو تالفة.");
    }
    const parts = encryptedText.split('-');
    const complexity = parseInt(parts[1], 10);
    const base64String = parts.slice(2).join('-');
    if (isNaN(complexity)) {
         throw new Error("مستوى التعقيد في النص المشفر غير صالح.");
    }
    let currentText;
    try {
         currentText = decodeURIComponent(escape(atob(base64String)));
    } catch (e) {
        throw new Error("النص المشفر تالف ولا يمكن فك ترميزه.");
    }
    for (let i = complexity - 1; i >= 0; i--) {
        currentText = Array.from(currentText).map((char, index) => {
            const charCode = char.charCodeAt(0);
            const key = (index % 128) ^ (i * 5 + 3);
            return String.fromCharCode(charCode ^ key);
        }).join('');
    }
    return currentText;
}
// --- نهاية قسم الخوارزميات ---


// 4. برمجة الأوامر التي سيستجيب لها البوت

// أمر /start للترحيب بالمستخدم
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
أهلاً بك في بوت التشفير الخاص بـ عبدالرحمن حسن!

استخدم الأوامر التالية:
- لتشفير نص:
/encrypt <مستوى التعقيد> <النص المراد تشفيره>
مثال: \`/encrypt 5 السلام عليكم\`

- لفك تشفير نص:
/decrypt <النص المشفر>
مثال: \`/decrypt ARv6-5-....\`
    `;
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// أمر /encrypt للتشفير
bot.onText(/\/encrypt (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const parts = match[1].split(' ');
    
    if (parts.length < 2) {
        bot.sendMessage(chatId, 'خطأ: الصيغة غير صحيحة. الرجاء استخدام:\n/encrypt <التعقيد> <النص>');
        return;
    }

    const complexity = parseInt(parts[0], 10);
    const textToEncrypt = parts.slice(1).join(' ');

    if (isNaN(complexity) || complexity < 1 || complexity > 10) {
        bot.sendMessage(chatId, 'خطأ: مستوى التعقيد يجب أن يكون رقمًا بين 1 و 10.');
        return;
    }

    try {
        const encryptedText = customEncrypt(textToEncrypt, complexity);
        bot.sendMessage(chatId, `✅ *النص المشفر:*\n\`${encryptedText}\``, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, `حدث خطأ: ${e.message}`);
    }
});

// أمر /decrypt لفك التشفير
bot.onText(/\/decrypt (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const textToDecrypt = match[1];

    try {
        const decryptedText = customDecrypt(textToDecrypt);
        bot.sendMessage(chatId, `✅ *النص الأصلي:*\n${decryptedText}`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, `حدث خطأ: ${e.message}`);
    }
});

console.log('Bot is running...');

