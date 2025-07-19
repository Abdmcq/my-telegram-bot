// 1. استيراد المكتبات اللازمة
const TelegramBot = require('node-telegram-bot-api');
const express = require('express'); // المكتبة الجديدة للخادم

// 2. إعداد المتغيرات الأساسية
const token = 'YOUR_TELEGRAM_BOT_TOKEN'; // ضع التوكن الخاص بك هنا
const port = process.env.PORT || 3000; // المنفذ الذي ستستمع إليه الخدمة

// 3. إنشاء نسخة من البوت وتطبيق الخادم
const bot = new TelegramBot(token, { polling: true });
const app = express(); // إنشاء تطبيق الخادم

// --- خوارزميات التشفير وفك التشفير (تبقى كما هي) ---
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

// 4. إعداد الخادم للرد على Uptime Robot
// هذا هو الجزء الجديد والمهم
app.get('/', (req, res) => {
    res.send('Bot is alive and running!');
});

// 5. تشغيل الخادم للاستماع للطلبات
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// 6. برمجة أوامر البوت (تبقى كما هي)
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

console.log('Bot is running and server is listening...');

