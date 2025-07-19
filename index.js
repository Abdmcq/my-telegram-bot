// 1. استيراد المكتبات اللازمة
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// 2. إعداد المتغيرات الأساسية
// تأكد من وضع التوكن الصحيح هنا
const token = 'YOUR_TELEGRAM_BOT_TOKEN'; 
// هذا هو رابط الخدمة الخاص بك من Render
const url = 'https://my-telegram-bot-bkgs.onrender.com'; 
const port = process.env.PORT || 3000;

// 3. إنشاء نسخة من البوت (بدون Polling) وتطبيق الخادم
const bot = new TelegramBot(token);
const app = express();

// استخدام express.json() لقراءة البيانات القادمة من تليجرام
app.use(express.json());

// 4. إعداد الـ Webhook
// نخبر تليجرام أين يرسل التحديثات
bot.setWebHook(`${url}/bot${token}`);

// 5. إنشاء مسار لاستقبال التحديثات من تليجرام
// هذا هو الجزء الذي يستقبل الرسائل
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200); // نرسل رداً لتأكيد الاستلام
});

// 6. تشغيل الخادم للاستماع للطلبات
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

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


// 7. برمجة أوامر البوت (تبقى كما هي)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
أهلاً بك في بوت التشفير الخاص بـ عبدالرحمن حسن! (إصدار Webhook)

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

console.log('Bot is running in webhook mode...');

