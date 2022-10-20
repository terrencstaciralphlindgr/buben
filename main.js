import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import bubenBot from './utils/buben.js';
import messages from './utils/messages.js';
import DB from './utils/pg.js';
import keyboards from './utils/keyboards.js';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import fs from 'fs';

const streams = [{ stream: process.stdout }, { stream: fs.createWriteStream('./logs/file.log', { flags: 'a' }) }];

const logger = pino({ level: 'info' }, pinoms.multistream(streams));

dotenv.config();
const db = new DB();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const supportBot = new TelegramBot(process.env.SUPPORT_BOT_TOKEN, { polling: true });
const buben = new bubenBot();
let chatId = 0;
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

// supportBot.onText(re('/start'), async (msg) => {
//     console.log(msg.chat.id);
//     await supportBot.sendMessage(msg.chat.id, messages['/start']);
// });
// =====================================================================

// supportBot.onText(re('/add (.+)'), async (msg, match) => {
//     console.log(match[1]);
//     const [userId, apiKeys, accountId, apiKey, apiSecret, name, botId, baseOrder] = match[1].split('|');
//     await db.addBot({ botId, apiKey, apiSecret, name, accountId });
//     await db.addUserBot({ userId, botId, apiKeys, baseOrder });
//     await supportBot.sendMessage(msg.chat.id, 'Бот добавлен!');
//     const opts = {
//         reply_markup: {
//             keyboard: keyboards['Начать'],
//             resize_keyboard: true,
//         },
//     };
//     const res = await db.getUserById(userId);
//     await bot.sendMessage(res.chat_id, 'Ваш первый бот полностью готов к работе\nДля начала, нажмите Начать', opts);
// });
// =====================================================================
// =====================================================================
bot.onText(re('/start'), async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;
    const res = await buben.userNew(chatId, username);

    if (!res) {
        await bot.sendMessage(chatId, 'Что-то пошло не так, обратитесь в поддержку {{ссылка на бот поддержки}}');
        return;
    }
    console.log(res);
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
    const enterApiKeys = async () => {
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
        const opts2 = {
            reply_markup: {
                inline_keyboard: [[{ text: 'Trial', callback_data: '/trial' }]],
            },
        };
        const apiKeys = await buben.userHasApiKeys(msg.chat.id);

        !apiKeys.length
            ? bot.sendMessage(msg.chat.id, messages['email'], opts)
            : bot.sendMessage(msg.chat.id, messages['Выберите тариф'], opts2);
    };

    const enterEmail = async (msg) => {
        const namePrompt = await bot.sendMessage(msg.chat.id, messages['Начать торговлю'], {
            reply_markup: {
                force_reply: true,
            },
        });
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
            const isEmail = validateEmail(msg.text);

            if (isEmail) {
                await db.addUserEmail({ id: msg.chat.id, email: msg.text });

                bot.sendMessage(msg.chat.id, 'Email успешно добавлен!');
                enterApiKeys();
            } else {
                enterEmail(msg);
            }
        });
    };
    (await buben.userHasEmail(msg.chat.id)) ? enterApiKeys() : enterEmail(msg);
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
            buben.setUserApiKeys({ apiKey: msg.text });

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
        const addUserApiKeys = async () => {
            const apiKeys = buben.getUserApiKeys();
            const exchange = await buben.getExchange(+apiKeys.exchangeId);
            console.log(exchange);
            const newAccount = await buben.newAccount({
                type: exchange.market_code,
                name: 'User' + msg.chat.id,
                api_key: apiKeys.apiKey,
                secret: apiKeys.secretKey,
            });
            console.log(newAccount);
            if (newAccount.error) {
                bot.sendMessage(
                    msg.chat.id,
                    newAccount.error_attributes.api_key[0] || 'API keys are no longer valid or incorrect.',
                );
                const opts = {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Ввести api key', callback_data: '/api_key' }]],
                    },
                };
                bot.sendMessage(
                    msg.chat.id,
                    'Для подключения бота введите API-ключ для вашего аккаунта. Не забудьте дать разрешение ключу на торговлю. Подробную инструкцию по добавлению API-ключей смотрите здесь.',
                    opts,
                );
                return false;
            }
            buben.userAddApiKeys({
                user_id: msg.chat.id,
                api_key: apiKeys.apiKey,
                api_secret: apiKeys.secretKey,
                exchange_id: exchange.exchange_id,
                account_id: newAccount.id,
                name: exchange.name + ' ' + apiKeys.apiKey.substring(0, 5),
            });

            return true;
        };

        const namePrompt = await bot.sendMessage(msg.chat.id, messages['/secret_key'][0], {
            reply_markup: {
                force_reply: true,
            },
        });
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
            buben.setUserApiKeys({ secretKey: msg.text });

            const opts = {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Trial', callback_data: '/trial' }]],
                },
            };
            await bot.sendMessage(msg.chat.id, messages['/secret_key'][1]);
            (await addUserApiKeys()) ? await bot.sendMessage(msg.chat.id, messages['Выберите тариф'], opts) : false;
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action === '/exchange_yes') {
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Binance', callback_data: '/exchange|Binance:1' }],
                    // [
                    //     { text: 'Bitstamp', callback_data: '/exchange|Bitstamp:3' },
                    //     { text: 'Bitfinex', callback_data: '/exchange|Bitfinex:4' },
                    // ],
                    // [
                    //     { text: 'Bitmex', callback_data: '/exchange|Bitmex:5' },
                    //     { text: 'Coinbase', callback_data: '/exchange|Coinbase:6' },
                    // ],
                    // [
                    //     { text: 'Huobi', callback_data: '/exchange|Huobi:7' },
                    //     { text: 'KuCoin', callback_data: '/exchange|KuCoin:8' },
                    // ],
                    // [
                    //     { text: 'OKX', callback_data: '/exchange|OKX:9' },
                    //     { text: 'FTX', callback_data: '/exchange|FTX:10' },
                    // ],
                    // [
                    //     { text: 'FTX US', callback_data: '/exchange|FTX US:11' },
                    //     { text: 'Bybit', callback_data: '/exchange|Bybit:12' },
                    // ],
                    // [
                    //     { text: 'Deribit', callback_data: '/exchange|Deribit:13' },
                    //     { text: 'Kraken', callback_data: '/exchange|Kraken:14' },
                    // ],
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
        buben.setUserApiKeys({ exchangeId });

        const opts = {
            reply_markup: {
                inline_keyboard: [[{ text: 'Ввести api key', callback_data: '/api_key' }]],
            },
        };
        await bot.sendMessage(
            msg.chat.id,
            'Для подключения бота введите API-ключ для вашего аккаунта. Не забудьте дать разрешение ключу на торговлю. Подробную инструкцию по добавлению API-ключей смотрите здесь.',
            opts,
        );
    }
    if (action.includes('/bot|')) {
        const selectedBotId = action.split('|')[1].trim();
        buben.setUserApiKeys({ selectedBotId });

        const apiKeys = await buben.userGetApiKeys(msg.chat.id);
        if (apiKeys.length) {
            const keyboard = [];
            apiKeys.map((key) => {
                keyboard.push([{ text: key.name, callback_data: `/api|${key.account_id}:${key.api_id}` }]);
            });
            const opts = {
                reply_markup: {
                    inline_keyboard: keyboard,
                },
            };
            bot.sendMessage(msg.chat.id, 'У вас есть добавленные биржи, выберите из списка:', opts);
        }
    }
    if (action.includes('/api|')) {
        const account = action.split('|')[1].trim();
        const [account_id, api_id] = account.split(':');
        const bot_id = buben.getUserApiKeys().selectedBotId;
        console.log(account_id, bot_id);
        const bot3com = await buben.addBot({ bot_id, account_id, user_id: msg.chat.id });
        console.log(bot3com);
        const newBot = await buben.userAddBot({ user_bot_id: bot3com.id, user_id: msg.chat.id, bot_id, api_keys: api_id });
        const opts = {
            reply_markup: {
                keyboard: keyboards['Начать'],
                resize_keyboard: true,
            },
        };
        bot.sendMessage(msg.chat.id, 'Бот успешно добавлен!', opts);
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if (action.includes('/trial')) {
        try {
            const res = await db.getUserBotByUserId(msg.chat.id);
            if (res.length) {
                const opts = {
                    reply_markup: {
                        keyboard: keyboards['Начать'],
                        resize_keyboard: true,
                    },
                };
                bot.sendMessage(msg.chat.id, 'У вас есть бот, нажмите начать, чтобы продолжить работу с ботом', opts);
                return;
            }
            const opts = {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Preset 2', callback_data: '/bot|9921197' }]],
                },
            };
            bot.sendMessage(msg.chat.id, 'Список ботов:\nPreset 2 classic (fast) BUSD/ETH.');
            bot.sendMessage(msg.chat.id, 'Выберите бота', opts);
        } catch (error) {
            logger.error(error);
        }
        // await supportBot.sendMessage(-1001800655460, message);
    } // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
});
// =====================================================================

// =====================================================================
bot.onText(re('Начать'), async (msg) => {
    chatId = msg.chat.id;
    try {
        const opts = {
            reply_markup: {
                keyboard: keyboards['BOT'],
                resize_keyboard: true,
            },
        };
        const res = await db.getUserBotByUserId(msg.chat.id);

        bot.sendMessage(msg.chat.id, 'Выберите команду из меню:', opts);
    } catch (error) {
        logger.error(error);
    }
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
    const res = await db.getUserBotByUserId(msg.chat.id);
    const stat = await buben.getUserBotStat(res[0].user_bot_id);
    bot.sendMessage(
        msg.chat.id,
        `*Статистика*\n${res[0].name}\n\nTotal profit: ${stat.profits_in_usd.overall_usd_profit} USDT\nDay profit: ${stat.profits_in_usd.today_usd_profit} USDT`,
        {
            parse_mode: 'Markdown',
        },
    );
    bot.sendMessage(msg.chat.id, 'Выберите команду из меню:', opts);
});
// =====================================================================

// =====================================================================
bot.onText(re('Статус'), async (msg) => {
    const opts = {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const res = await db.getUserBotByUserId(msg.chat.id);
    const status = await buben.getUserBotStatus(res[0].user_bot_id);
    let message = status.is_enabled ? `*Статус* \n${res[0].name} включен ✅\n\n` : `*Статус* \n${res[0].name} выключен ❌\n\n`;
    message += status.active_deals.length
        ? `Сделка активна ✅\n\n Сумма в сделке:${status.active_deals_usd_profit} USDT\n\nСделок завершено: ${status.finished_deals_count}`
        : `Нет активных сделок: ❌\n\nСделок завершено: ${status.finished_deals_count}`;

    bot.sendMessage(msg.chat.id, message, opts);
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
    const res = await db.getUserBotByUserId(msg.chat.id);
    const start = await buben.startBot(res[0].user_bot_id);
    bot.sendMessage(msg.chat.id, `${res[0].name} запущен`, opts);
});
// =====================================================================

bot.onText(re('Остановить бот'), async (msg) => {
    const opts = {
        reply_markup: {
            keyboard: keyboards['BOT'],
            resize_keyboard: true,
        },
    };
    const res = await db.getUserBotByUserId(msg.chat.id);
    buben.stopBot(res[0].user_bot_id);

    bot.sendMessage(msg.chat.id, `${res[0].name} остановлен`, opts);
});
// =====================================================================
bot.onText(re('Изменить депозит'), async (msg) => {
    const namePrompt = await bot.sendMessage(msg.chat.id, 'Введите сумму депозита:', {
        reply_markup: {
            force_reply: true,
        },
    });
    bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (msg) => {
        const dep = msg.text;
        const res = await db.getUserBotByUserId(msg.chat.id);
        const bots = await db.getBot(res[0].bot_id);
        const { base_ratio, safety_ratio } = bots;
        const base_order_volume = Math.round(+base_ratio * dep * 100) / 100;
        const safety_order_volume = Math.round(+safety_ratio * dep * 100) / 100;
        const opts = {
            reply_markup: {
                keyboard: keyboards['BOT'],
                resize_keyboard: true,
            },
        };
        const updatedBot = await buben.editBot({ bot_id: res[0].user_bot_id, safety_order_volume, base_order_volume });
        if (updatedBot.error) {
            bot.sendMessage(msg.chat.id, 'Минимальный депозит 360 USDT!', opts);
            return;
        }

        bot.sendMessage(msg.chat.id, 'Депозит успешно изменен!', opts);
        // const opts = {
        //     reply_markup: {
        //         inline_keyboard: [[{ text: 'Trial', callback_data: '/trial' }]],
        //     },
        // };
        // await bot.sendMessage(msg.chat.id, messages['/secret_key'][1]);
        // (await addUserApiKeys()) ? await bot.sendMessage(msg.chat.id, messages['Выберите тариф'], opts) : false;
    });
});
// =====================================================================

const dealCheck = async (chatId) => {
    const res = await db.getUserBotByUserId(chatId);
    const deal = await buben.userCheckDeals({ bot_id: res[0].user_bot_id });
    if (deal) {
        let message = '';

        message += `${res[0].name} обновил статус сделки\nStatus: ${deal.localized_status}${
            deal.base_order_average_price ? '\nPrice: ' + deal.base_order_average_price : ''
        }${
            deal.error
                ? `\nError: ${deal.error_message} `
                : `\nActual profit: ${Math.round(deal.actual_usd_profit * 100) / 100} USD\n${
                      deal.deal_cancel_time ? 'Cancel time: ' + new Date(deal.deal_cancel_time * 1000).toISOString() : ''
                  }`
        }`;
        return message;
    }
};
setInterval(async () => {
    if (!chatId) return;
    const deal = await dealCheck(chatId);
    if (deal) {
        bot.sendMessage(chatId, deal);
    }
}, 2000);

