const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

// Вставте сюди токен вашого бота з BotFather (той самий, що в telegram.js)
const token = '8735519028:AAF0JXwIm3gS4JftOo7gXPvvQ4jUOzjEkto';

// Запускаємо бота у режимі 'polling', щоб він міг отримувати повідомлення
const bot = new TelegramBot(token, { polling: true });

const usersFile = path.join(__dirname, 'users.json');

// Функція для збереження користувачів
function saveUser(msg) {
    let users = [];
    if (fs.existsSync(usersFile)) {
        try {
            users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        } catch (e) {}
    }
    
    const userExists = users.find(u => u.chatId === msg.from.id);
    if (!userExists) {
        users.push({
            chatId: msg.from.id,
            first_name: msg.from.first_name || '',
            last_name: msg.from.last_name || '',
            username: msg.from.username || '',
            joinedAt: new Date().toLocaleString('uk-UA')
        });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        // Сповіщаємо власника про нового користувача
        const adminChatId = "6018966220";
        const usernameTag = msg.from.username ? `@${msg.from.username}` : 'без юзернейму';
        bot.sendMessage(adminChatId, `👤 <b>Новий клієнт зайшов у бота з сайту:</b>\nІм'я: ${msg.from.first_name}\nUsername: ${usernameTag}`, { parse_mode: 'HTML' }).catch(()=>{});
    }
}

console.log('Бот GardenPro_Bot успішно запущений і чекає на повідомлення...');

// Обробка команди /start
// Коли клієнт переходить за посиланням t.me/GardenPro_Bot?start=sekator 
// Бот автоматично отримує повідомлення типу "/start sekator"
bot.onText(/\/start( (.+))?/, (msg, match) => {
    // Зберігаємо користувача в базу при старті
    saveUser(msg);

    const chatId = msg.chat.id;
    // Отримуємо параметр (у нашому випадку 'sekator' або 'nabor'), якщо він є
    const payload = match[2] ? match[2].trim() : '';

    if (payload === 'sekator') {
        const photoPath = path.join(__dirname, 'img', 'hero-new-pruners.jpg');
        
        const captionText = `
🔥 <b>Акумуляторний секатор GardenPRO 48V</b>

✂️ <b>Працює за вас:</b> Ріже міцні гілки як масло (до 30 мм). Нуль зусиль та ніякої втоми для рук!
🔋 <b>Комплектація МАКСИМУМ:</b> 2 літієві батареї (48V), надійний кейс та зарядний пристрій.
🏆 <b>Результат:</b> Робите всю роботу в саду вдвічі швидше.

✅ Оплата при отриманні!
🚚 Доставка Новою Поштою (1-2 дні).

<i>Натискайте на кнопку нижче щоб оформити замовлення зі знижкою!</i>
`;

        const options = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Оформити замовлення", callback_data: "order_sekator" }],
                    [{ text: "💬 Поставити запитання експерту", callback_data: "ask_question" }]
                ]
            }
        };

        // Перевіряємо, чи є в нас фото і надсилаємо
        if (fs.existsSync(photoPath)) {
            bot.sendPhoto(chatId, photoPath, { ...options, caption: captionText })
               .catch(err => console.error("Помилка відправки фото: ", err));
        } else {
            bot.sendMessage(chatId, captionText, options);
        }

    } else if (payload === 'nabor') {
        const photoPath = path.join(__dirname, 'img', 'nabor', '29825413166863.webp');

        const captionText = `
🧰 <b>Набір інструментів PRO 216 предметів</b>

🔩 <b>Хром-ванадієва сталь (Cr-V):</b> Ключі, головки та тріскачки витримують великі навантаження і не злизують грані болтів.
⚙️ <b>3 тріскачки (1/2", 3/8", 1/4"):</b> Дістаєтесь до будь-якого болта навіть у найважкодоступніших місцях авто.
🎁 <b>216 предметів в кейсі:</b> Ключі, головки, біти (HEX, TORX, PH, PZ), подовжувачі, кардани — все що потрібно для ремонту.
💼 <b>Міцний кейс:</b> Кожен інструмент на своєму місці — жодного хаосу в гаражі.

💰 Ціна: <b>2 290 грн</b> (замість 4 900 грн) — знижка <b>53%</b>!
✅ Оплата при отриманні!
🚚 Доставка Новою Поштою (1-2 дні).

<i>Натискайте на кнопку нижче щоб оформити замовлення зі знижкою!</i>
`;

        const options = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Оформити замовлення", callback_data: "order_nabor" }],
                    [{ text: "💬 Поставити запитання експерту", callback_data: "ask_question" }]
                ]
            }
        };

        if (fs.existsSync(photoPath)) {
            bot.sendPhoto(chatId, photoPath, { ...options, caption: captionText })
               .catch(err => console.error("Помилка відправки фото: ", err));
        } else {
            bot.sendMessage(chatId, captionText, options);
        }

    } else {
        // Якщо клієнт просто пише /start без параметра
        bot.sendMessage(chatId, "Вітаємо у магазині <b>GardenPRO</b>!\nМи професійно займаємось садовим інструментом. Якщо маєте запитання - пишіть сюди!", { parse_mode: 'HTML' });
    }
});

// Секретна команда для Адміна, щоб скачати базу клієнтів
bot.onText(/\/admin/, (msg) => {
    const adminChatId = "6018966220";
    // Перевіряємо, чи команду викликав саме власник магазину
    if (msg.chat.id.toString() !== adminChatId) return;

    if (fs.existsSync(usersFile)) {
        try {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            bot.sendMessage(msg.chat.id, `📊 <b>Статистика:</b>\nКількість клієнтів у базі: <b>${users.length}</b>\n\nФайл з базою відправляю:`, { parse_mode: 'HTML' });
            bot.sendDocument(msg.chat.id, usersFile);
        } catch(e) {
            bot.sendMessage(msg.chat.id, "Сталася помилка при читанні бази даних.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "📭 База клієнтів поки порожня. Немає збережених користувачів.");
    }
});

// Масова розсилка (Broadcast) для всіх клієнтів
bot.onText(/\/broadcast (.+)/, (msg, match) => {
    const adminChatId = "6018966220";
    if (msg.chat.id.toString() !== adminChatId) return;

    const messageToBroadcast = match[1];

    if (fs.existsSync(usersFile)) {
        try {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            let validCount = 0;
            users.forEach(u => {
                // Відправляємо повідомлення кожному клієнту
                bot.sendMessage(u.chatId, messageToBroadcast, { parse_mode: 'HTML' })
                   .then(() => validCount++)
                   .catch(() => {}); // ігноруємо якщо хтось заблокував бота
            });
            // Повідомляємо адміна про успіх (через таймаут щоб встигли відправитись)
            setTimeout(() => {
                bot.sendMessage(msg.chat.id, `✅ <b>Розсилка завершена!</b>\nВаше повідомлення відправлено користувачам.`, { parse_mode: 'HTML' });
            }, 1000);
        } catch(e) {
            bot.sendMessage(msg.chat.id, "Сталася помилка при читанні бази даних.");
        }
    } else {
        bot.sendMessage(msg.chat.id, "📭 База клієнтів поки порожня. Розсилку робити нікому.");
    }
});

// Зберігаємо яке замовлення обрав клієнт
const pendingOrders = {}; // chatId => productName

// Обробка кліків на кнопки під повідомленням
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    // Відповідь Telegram (щоб кнопка перестала "крутитися")
    bot.answerCallbackQuery(query.id);

    if (data === 'order_sekator') {
        pendingOrders[chatId] = 'Секатор GardenPRO 48V';
        bot.sendMessage(chatId, "<b>Замовлення Секатора PRO-48V:</b>\n\nВведіть ваш <b>номер телефону</b> або натисніть кнопку нижче щоб поділитись ним.", {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{ text: '📞 Поділитися моїм номером телефону', request_contact: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (data === 'order_nabor') {
        pendingOrders[chatId] = 'Набір інструментів PRO 216 предметів';
        bot.sendMessage(chatId, "<b>Замовлення Набору інструментів 216 предметів:</b>\n\nВведіть ваш <b>номер телефону</b> або натисніть кнопку нижче щоб поділитись ним.", {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{ text: '📞 Поділитися моїм номером телефону', request_contact: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (data === 'ask_question') {
        bot.sendMessage(chatId, "<b>Давайте поспілкуємось!</b>\nПросто напишіть ваше запитання сюди у чат, і наш менеджер вам одразу ж відповість.", { parse_mode: 'HTML' });
    }
});

// Обробка тексту від користувача (ймовірно ім'я/телефон або питання)
bot.on('message', (msg) => {
    // Ігноруємо команди, щоб не відповідати на /start 
    if (msg.text && msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const text = msg.text || '';

    // Якщо клієнт надіслав свій контакт
    if (msg.contact) {
        bot.sendMessage(chatId, "✅ <b>Дякуємо! Номер збережено.</b>\nНаш менеджер зв'яжеться з вами за 5 хвилин для уточнення деталей доставки.", { 
            parse_mode: 'HTML',
            reply_markup: {
                remove_keyboard: true
            }
        });
        
        const adminChatId = "6018966220";
        const userName = msg.from.first_name || "Клієнт";
        const productName = pendingOrders[chatId] || 'Невідомий товар';
        delete pendingOrders[chatId];
        bot.sendMessage(adminChatId, `🔥 <b>ЗАМОВЛЕННЯ З TELEGRAM БОТА</b>\nТовар: ${productName}\nІм'я: ${userName}\nТелефон: ${msg.contact.phone_number}`, { parse_mode: 'HTML' });
        
        return;
    }

    // Відписуємось якщо є текст, мінімально
    if (text.length > 3) {
        // Щоб бот не надокучав на кожне слово, просто підтверджуємо, або пересилаємо питання
        const adminChatId = "6018966220"; // ваш Chat ID із telegram.js
        bot.sendMessage(adminChatId, `💬 <b>Повідомлення від клієнта (${msg.from.first_name}):</b>\n\n${text}`, { parse_mode: 'HTML' });
        bot.sendMessage(chatId, "Прийнято! Передав інформацію менеджеру. Очікуйте на відповідь.", { parse_mode: 'HTML' });
    }
});
