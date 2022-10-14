import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import nwcmBot from './utils/nwcm.js';
import messages from './utils/messages.js';
import DB from './utils/pg.js';
import keyboards from './utils/keyboards.js';
dotenv.config();
const db = new DB();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const supportBot = new TelegramBot(process.env.SUPPORT_BOT_TOKEN, { polling: true });
const nwcm = new nwcmBot();
const dealCheck = async () => {
    const deal = await nwcm.checkUserDeals();
    if (deal) {
        let message = '';

        message += `id: ${deal.id}\nStatus: ${deal.localized_status}\nPrice: ${deal.base_order_average_price} ${
            deal.error ? `\nError: ${deal.error_message}` : ''
        }\nActual profit: ${Math.round(deal.actual_usd_profit * 100) / 100} USD\n${
            deal.deal_cancel_time ? 'Cancel time: ' + new Date(deal.deal_cancel_time * 1000).toISOString() : ''
        }\n-----\n`;
        return message;
    }
};

const re = (regex) => {
    return new RegExp('^' + regex + '$');
};
const validateEmail = (email) => {
    const emailRegexp = new RegExp(
        /^[a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1}([a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1})*[a-zA-Z0-9]@[a-zA-Z0-9][-\.]{0,1}([a-zA-Z][-\.]{0,1})*[a-zA-Z0-9]\.[a-zA-Z0-9]{1,}([\.\-]{0,1}[a-zA-Z]){0,}[a-zA-Z0-9]{0,}$/i,
    );

    return emailRegexp.test(email);
};
// =====================================================================

supportBot.onText(re('/start'), async (msg) => {
    console.log(msg.chat.id);
    await supportBot.sendMessage(msg.chat.id, messages['/start']);
});
// =====================================================================

supportBot.onText(re('/add (.+)'), async (msg, match) => {
    console.log(match[1]);
    const [userId, apiKeys, accountId, apiKey, apiSecret, name, botId, baseOrder] = match[1].split('|');
    await db.addBot({ botId, apiKey, apiSecret, name, accountId });
    await db.addUserBot({ userId, botId, apiKeys, baseOrder });
    await supportBot.sendMessage(msg.chat.id, 'Бот добавлен!');
    const opts = {
        reply_markup: {
            keyboard: keyboards['Начать'],
            resize_keyboard: true,
        },
    };
    const res = await db.getUserById(userId);
    await bot.sendMessage(res.chat_id, 'Ваш первый бот полностью готов к работе\nДля начала, нажмите Начать', opts);
});
// =====================================================================
// =====================================================================
bot.onText(re('/start'), async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;
    const res = await db.addUser({ chatId, username });

    if (res.error) {
        await bot.sendMessage(chatId, 'Что-то пошло не так, обратитесь в поддержку {{ссылка на бот поддержки}}');
        return;
    }
    const opts = {
        reply_markup: {
            keyboard: keyboards['/start'],
            resize_keyboard: true,
        },
    };
    await bot.sendMessage(chatId, messages['/start'], opts);
});
// =====================================================================
// =====================================================================
bot.onText(re('Start'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['Start'],
            resize_keyboard: true,
        },
    };
    await bot.sendMessage(msg.chat.id, messages['Start'], opts);
});
// =====================================================================
// =====================================================================
bot.onText(re('Начать торговлю'), async (msg) => {
    const enterEmail = async (msg) => {
        const namePrompt = await bot.sendMessage(msg.chat.id, messages['Начать торговлю'], {
            reply_markup: {
                force_reply: true,
            },
        });
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
            const isEmail = validateEmail(msg.text);
            console.log(msg.text);
            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Да', callback_data: '/exchange_yes' },
                            { text: 'Нет', callback_data: '/exchange_no' },
                        ],
                    ],
                },
            };
            if (isEmail) {
                const res = await db.addUserEmail({ chatId: msg.chat.id, email: msg.text });
                if (res.error)
                    bot.sendMessage(msg.chat.id, 'Что-то пошло не так, обратитесь в поддержку {{ссылка на бот поддержки}}');
                await bot.sendMessage(msg.chat.id, 'Email успешно добавлен!');
                await bot.sendMessage(msg.chat.id, messages['email'], opts);
            } else {
                enterEmail(msg);
            }
        });
    };
    enterEmail(msg);
});
// =====================================================================
// =====================================================================
bot.on('callback_query', async (query) => {
    const action = query.data;
    const msg = query.message;
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action === '/api_key') {
        const namePrompt = await bot.sendMessage(msg.chat.id, messages['/api_key'][0], {
            reply_markup: {
                force_reply: true,
            },
        });
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
            db.setApi({ apiKey: msg.text });

            const opts = {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Ввести api secret', callback_data: '/secret_key' }]],
                },
            };
            await bot.sendMessage(msg.chat.id, messages['/api_key'][1], opts);
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action === '/secret_key') {
        const namePrompt = await bot.sendMessage(msg.chat.id, messages['/secret_key'][0], {
            reply_markup: {
                force_reply: true,
            },
        });
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
            db.setApi({ secretKey: msg.text });

            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Trial', callback_data: '/trial' },
                            { text: 'Pro', callback_data: '/pro' },
                        ],
                    ],
                },
            };
            await bot.sendMessage(msg.chat.id, messages['/secret_key'][1]);
            await bot.sendMessage(msg.chat.id, messages['Выберите тариф'], opts);
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action === '/exchange_yes') {
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Binance', callback_data: '/exchange|Binance:1' },
                        { text: 'Bittrex', callback_data: '/exchange|Bittrex:2' },
                    ],
                    [
                        { text: 'Bitstamp', callback_data: '/exchange|Bitstamp:3' },
                        { text: 'Bitfinex', callback_data: '/exchange|Bitfinex:4' },
                    ],
                    [
                        { text: 'Bitmex', callback_data: '/exchange|Bitmex:5' },
                        { text: 'Coinbase', callback_data: '/exchange|Coinbase:6' },
                    ],
                    [
                        { text: 'Huobi', callback_data: '/exchange|Huobi:7' },
                        { text: 'KuCoin', callback_data: '/exchange|KuCoin:8' },
                    ],
                    [
                        { text: 'OKX', callback_data: '/exchange|OKX:9' },
                        { text: 'FTX', callback_data: '/exchange|FTX:10' },
                    ],
                    [
                        { text: 'FTX US', callback_data: '/exchange|FTX US:11' },
                        { text: 'Bybit', callback_data: '/exchange|Bybit:12' },
                    ],
                    [
                        { text: 'Deribit', callback_data: '/exchange|Deribit:13' },
                        { text: 'Kraken', callback_data: '/exchange|Kraken:14' },
                    ],
                ],
            },
        };
        await bot.sendMessage(msg.chat.id, 'Выберите биржу', opts);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action.includes('/exchange|')) {
        const exchangeData = action.split('|')[1].trim();
        const [exchange, exchangeId] = exchangeData.split(':');
        db.setApi({ exchangeId });
        const opts = {
            reply_markup: {
                force_reply: true,
            },
        };
        await bot.sendMessage(msg.chat.id, 'Вы выбрали ' + exchange);
        const namePrompt = await bot.sendMessage(msg.chat.id, 'введите сумму с которой будет торговать ваш первый бот', opts);
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
            db.setApi({ baseOrder: msg.text });

            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Ввести api key', callback_data: '/api_key' },
                            { text: 'Ввести api secret', callback_data: '/secret_key' },
                        ],
                    ],
                },
            };
            await bot.sendMessage(msg.chat.id, 'Для подключения бота введите API ключи вашего аккаунта', opts);
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action.includes('/trial')) {
        await bot.sendMessage(msg.chat.id, 'мы создаем бота. как только бот будет запущен вы получите оповещение');
        const params = db.getApi();
        const user = await db.getUserByChatId(msg.chat.id);
        const start = new Date().toISOString();
        const endMs = new Date(start).getTime() + 2592000000;
        const end = new Date(endMs).toISOString();
        await db.addSubscription({ start, end, userId: user.id, isPro: false });
        const res = await db.addApiKeys({ userId: user.id });
        const message = `Пользователь выбрал тариф: Trial\nUserId: ${user.id}\nApiId: ${res.apiId}\nEmail: ${user.email}\nExchangeId: ${params.exchangeId}\nApi Key: ${params.apiKey}\nSecret Key: ${params.secretKey}\nBase order: ${params.baseOrder}`;
        await supportBot.sendMessage(-1001800655460, message);
    } // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
});
// =====================================================================

// =====================================================================
bot.onText(re('Начать'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const user = await db.getUserByChatId(msg.chat.id);
    const res = await db.getUserBotByUserId(user.id);
    nwcm.setApiKeys(res.api_key, res.api_secret);
    setInterval(async () => {
        const deal = await dealCheck();
        if (deal) {
            bot.sendMessage(msg.chat.id, deal);
        }
    }, 2000);
    bot.sendMessage(msg.chat.id, 'Выберите команду из меню:', opts);
});
// =====================================================================
// =====================================================================
bot.onText(re('Статистика'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const user = await db.getUserByChatId(msg.chat.id);
    const res = await db.getUserBotByUserId(user.id);
    const stat = await nwcm.statisticsSingleBot(res.bot_id);
    bot.sendMessage(msg.chat.id, res.name + '\nProfit: ' + stat.profit + ' USD');
    bot.sendMessage(msg.chat.id, 'Выберите команду из меню:', opts);
});
// =====================================================================

// =====================================================================
bot.onText(re('Статус'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const user = await db.getUserByChatId(msg.chat.id);
    const res = await db.getUserBotByUserId(user.id);
    const status = await nwcm.statusSingleBot(res.bot_id);
    let message = status.enable ? `${res.name} enabled ✅\n` : `${res.name} disabled ❌\n`;
    message += status.deal[0]
        ? `Deal: ✅\n id:${status.deal[0].id}\n profit:${Math.round(status.deal[0].actual_profit * 100) / 100} USD`
        : `Deal: ❌\nnone`;
    message += '\n-----\n';

    bot.sendMessage(msg.chat.id, message);
    bot.sendMessage(msg.chat.id, 'Выберите команду из меню:', opts);
});
// =====================================================================
// =====================================================================
bot.onText(re('Запуск бота'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const user = await db.getUserByChatId(msg.chat.id);
    const res = await db.getUserBotByUserId(user.id);
    nwcm.startSingleBot(res.bot_id);

    bot.sendMessage(msg.chat.id, 'БОТ запущен', opts);
});
// =====================================================================

bot.onText(re('Остановить бот'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const user = await db.getUserByChatId(msg.chat.id);
    const res = await db.getUserBotByUserId(user.id);
    nwcm.stopSingleBot(res.bot_id);

    bot.sendMessage(msg.chat.id, 'Выберите команду из меню:', opts);
});
// =====================================================================

