// 1. استيراد المكتبات اللازمة
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// 2. إعداد المتغيرات الأساسية من بيئة العمل (Render)
const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL;
const port = process.env.PORT || 3000;

// التحقق من وجود التوكن
if (!token) {
  console.error('CRITICAL ERROR: TELEGRAM_BOT_TOKEN is not defined!');
  process.exit(1);
}

// 3. إنشاء نسخة من البوت وتطبيق الخادم
const bot = new TelegramBot(token);
const app = express();

// استخدام express.json() لقراءة البيانات القادمة من تليجرام
app.use(express.json());

// 4. إعداد الـ Webhook
if (url) {
    bot.setWebHook(`${url}/bot${token}`);
    console.log(`Webhook set to ${url}/bot${token}`);
}

// --- الجزء الجديد لإصلاح Uptime Robot ---
// 5. إنشاء مسار للصفحة الرئيسية للرد على Uptime Robot
app.get('/', (req, res) => {
    res.send('Hello from the bot! I am alive and well.');
});
// --- نهاية الجزء الجديد ---

// 6. إنشاء مسار لاستقبال التحديثات من تليجرام
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 7. تشغيل الخادم للاستماع للطلبات
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
        throw new Error("صار خطأ بالتشفير.");
    }
}

function customDecrypt(encryptedText) {
    if (!encryptedText.startsWith('ARv6-')) {
        throw new Error("صيغة النص المشفر بيها غلط.");
    }
    const parts = encryptedText.split('-');
    const complexity = parseInt(parts[1], 10);
    const base64String = parts.slice(2).join('-');
    if (isNaN(complexity)) {
         throw new Error("مستوى التشفير الخاص غير صالح.");
    }
    let currentText;
    try {
         currentText = decodeURIComponent(escape(atob(base64String)));
    } catch (e) {
        throw new Error("النص المشفر تالف.");
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


// 8. برمجة أوامر البوت (تبقى كما هي)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
حياكم الله وبياكم المطور عبد وياكم 
استخدم الأوامر التالية:
- لتشفير نص:
/encrypt 
مثال: \`/encrypt 5 عبدالرحمن \`

- لفك تشفير النص:
/decrypt <النص المشفر>
مثال: \`/decrypt ARv6-5-....\`
    `;
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/encrypt (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const parts = match[1].split(' ');
    
    if (parts.length < 2) {
        bot.sendMessage(chatId, 'عندك خطأ عزيزي الصيغة مو صحيحة:\n/encrypt ');
        return;
    }

    const complexity = parseInt(parts[0], 10);
    const textToEncrypt = parts.slice(1).join(' ');

    if (isNaN(complexity) || complexity < 1 || complexity > 10) {
        bot.sendMessage(chatId, 'مستوى التشفير الخاص لازم يكون ضمن 10 مستويات بس');
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
        bot.sendMessage(chatId, `✅ *النص بعد فك التشفير:*\n${decryptedText}`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, `حدث خطأ: ${e.message}`);
    }
});

console.log('Bot is running in webhook mode and ready for pings...');
