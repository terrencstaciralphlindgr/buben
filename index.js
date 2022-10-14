// import TelegramBot from 'node-telegram-bot-api';
// import axios from 'axios';
// // import { botKeyboard, exchangeKeyboard, startKeyboard, startTradeKeyboard } from './utils/keyboards.js';
// import messages from './utils/messages.js';
// const token = '5721663039:AAFTGBjrQ45dKUHeOk6u_dFUp6ZQDV-XQVM';

// const bot = new TelegramBot(token, { polling: true });

// bot.onText(/\/test/, function onEditableText(msg) {
//     const data = { email: 'mabdev@ya.ru', password: '2Z|FXSBWk2' };

//     const config = {
//         method: 'post',
//         url: 'https://api.nowpayments.io/v1/auth',
//         headers: {},
//         data: data,
//     };
//     axios(config)
//         .then(function (response) {
//             const apiKey = JSON.stringify(response.data);
//             name('Y2M0VJG-M3E4ZJB-JKR8EHP-GXE7GWP');
//         })
//         .catch(function (error) {
//             console.log(error);
//         });
//     function name(apiKey) {
//         var data = JSON.stringify({
//             price_amount: 1000,
//             price_currency: 'usd',
//             order_id: 'RGDBP-21314',
//             order_description: 'Apple Macbook Pro 2019 x 1',
//             ipn_callback_url: 'https://nowpayments.io',
//             success_url: 'https://nowpayments.io',
//             cancel_url: 'https://nowpayments.io',
//         });

//         var config = {
//             method: 'post',
//             url: 'https://api.nowpayments.io/v1/invoice',
//             headers: {
//                 'x-api-key': apiKey,
//                 'Content-Type': 'application/json',
//             },
//             data: data,
//         };

//         axios(config)
//             .then(function (response) {
//                 console.log(JSON.stringify(response.data));
//             })
//             .catch(function (error) {
//                 console.log(error);
//             });
//     }
// });
// const reg = '/start';
// bot.onText(new RegExp(reg), function onEditableText(msg) {
//     const opts = {
//         reply_markup: {
//             keyboard: [['START'], ['Поддержка', 'F.A.Q']],
//             resize_keyboard: true,
//         },
//     };
//     bot.sendMessage(
//         msg.chat.id,
//         'Подпишитесь и управляйте любыми доступными торговыми ботами без ограничений.\n\nБоты полностью автономно торгуют вашей криптовалютой за вас.\nПредлагаются стратегии на любой вкус: фиксированные пары, боты с автовыбором валюты на основании торговых сигналов, фьючерсные боты с плечом и так далее.\nСредняя прибыльность ботов - от 2% до 100%  в месяц.\nНажмите “Посмотреть всех ботов” для просмотра витрины.\nЧто вы можете сделать сейчас:\nКупить полный доступ на 6 месяцев и начать торговлю немедленно\nКупить ограниченный доступ (только к одному боту) за $5 на неделю и попробовать\nПонаблюдать за работой текущего бота бесплатно\nУзнать больше или задать вопросы поддержке',
//         opts,
//     );
// });
// bot.onText(new RegExp(messages[0].q), function onEditableText(msg) {
//     const opts = {
//         reply_markup: {
//             keyboard: startTradeKeyboard,
//             resize_keyboard: true,
//         },
//     };
//     bot.sendMessage(msg.chat.id, messages[0].a, opts);
// });
// bot.onText(new RegExp(messages[1].q), function onEditableText(msg) {
//     const opts = {
//         reply_markup: {
//             force_reply: true,
//         },
//     };
//     bot.sendMessage(msg.chat.id, messages[1].a, opts);
// });
// bot.on('callback_query', function onCallbackQuery(callbackQuery) {
//     const action = callbackQuery.data;
//     const msg = callbackQuery.message;
//     if (action === '/acc') {
//         const opts = {
//             reply_markup: {
//                 // inline_keyboard: exchangeKeyboard,
//             },
//         };
//         bot.sendMessage(msg.chat.id, `Выберите биржу:`, opts);
//     }
//     if (action === 'accNotExist') {
//         bot.sendMessage(
//             msg.chat.id,
//             `<a href='https://telegra.ph/Instrukciya-po-sozdaniyu-akkaunta-na-Binance-09-30'>Подробная инструкция</a>`,
//             { parse_mode: 'HTML' },
//         );
//     }
//     if (action.includes('/exchange')) {
//         const opts = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: 'Да', callback_data: '/usdt_exist' },
//                         { text: 'Нет', callback_data: '/usdt_not_exist' },
//                     ],
//                 ],
//             },
//         };
//         bot.sendMessage(msg.chat.id, messages[5].a, opts);
//     }
//     if (action === messages[6].q || action === '/balance') {
//         const opts = {
//             reply_markup: {
//                 force_reply: true,
//             },
//         };
//         bot.sendMessage(msg.chat.id, messages[6].a, opts);
//     }
//     if (action === messages[7].q) {
//         const opts = {
//             reply_markup: {
//                 inline_keyboard: [[{ text: 'Баланс пополнен', callback_data: '/balance' }]],
//                 force_reply: true,
//             },
//         };
//         bot.sendMessage(msg.chat.id, messages[7].a, opts);
//     }
//     if (action === '/api_key') {
//         const opts = {
//             reply_markup: {
//                 force_reply: true,
//             },
//         };
//         bot.sendMessage(msg.chat.id, 'Введите ваш api key', opts);
//     }
//     if (action === '/secret_key') {
//         const opts = {
//             reply_markup: {
//                 force_reply: true,
//             },
//         };
//         bot.sendMessage(msg.chat.id, 'Введите ваш api secret', opts);
//     }
//     if (action === '/trial') {
//         var data = JSON.stringify({
//             price_amount: 5,
//             price_currency: 'usd',
//             order_id: 'NWCM-86481279',
//             order_description: 'Trial Bot Subscribe',
//             ipn_callback_url: 'https://nowpayments.io',
//             success_url: 'https://nowpayments.io',
//             cancel_url: 'https://nowpayments.io',
//         });

//         var config = {
//             method: 'post',
//             url: 'https://api.nowpayments.io/v1/invoice',
//             headers: {
//                 'x-api-key': 'Y2M0VJG-M3E4ZJB-JKR8EHP-GXE7GWP',
//                 'Content-Type': 'application/json',
//             },
//             data: data,
//         };

//         axios(config)
//             .then(function (response) {
//                 const paymentUrl = response.data.invoice_url;
//                 bot.sendMessage(msg.chat.id, 'Перейдите по ссылке для оплаты' + paymentUrl);
//             })
//             .catch(function (error) {
//                 console.log(error);
//             });

//         // const opts = {
//         //     reply_markup: {
//         //         force_reply: true,
//         //     },
//         // };
//     }
// });
// bot.on('message', (msg) => {
//     if (msg.reply_to_message) {
//         if (msg.reply_to_message.text === 'Введите ваш email для начала торговли') {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [[{ text: 'Да', callback_data: '/acc' }], [{ text: 'Нет', callback_data: 'accNotExist' }]],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, `Есть ли у вас аккаунт на криптобирже?`, opts);
//         }
//         if (msg.reply_to_message.text === messages[6].a) {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [
//                             { text: 'Ввести api key', callback_data: '/api_key' },
//                             { text: 'Ввести api secret', callback_data: '/secret_key' },
//                         ],
//                     ],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, 'Добавьте ключи по инструкции', opts);
//         }
//         if (msg.reply_to_message.text === 'Введите ваш api key') {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [[{ text: 'Ввести api secret', callback_data: '/secret_key' }]],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, 'Api key добавлен', opts);
//         }
//         if (msg.reply_to_message.text === 'Введите ваш api secret') {
//             bot.sendMessage(msg.chat.id, 'Api secret добавлен');
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Trial | Оплата', callback_data: '/trial' }],
//                         [{ text: 'PRO | Оплата', callback_data: '/pro' }],
//                     ],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, `Выберите подписку\n Описание подписок и цена`, opts);
//         }
//     }
// });
