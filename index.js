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
//             keyboard: [['START'], ['??????????????????', 'F.A.Q']],
//             resize_keyboard: true,
//         },
//     };
//     bot.sendMessage(
//         msg.chat.id,
//         '?????????????????????? ?? ???????????????????? ???????????? ???????????????????? ?????????????????? ???????????? ?????? ??????????????????????.\n\n???????? ?????????????????? ?????????????????? ?????????????? ?????????? ?????????????????????????? ???? ??????.\n???????????????????????? ?????????????????? ???? ?????????? ????????: ?????????????????????????? ????????, ???????? ?? ?????????????????????? ???????????? ???? ?????????????????? ???????????????? ????????????????, ???????????????????? ???????? ?? ???????????? ?? ?????? ??????????.\n?????????????? ???????????????????????? ?????????? - ???? 2% ???? 100%  ?? ??????????.\n?????????????? ??????????????????????? ???????? ????????????? ?????? ?????????????????? ??????????????.\n?????? ???? ???????????? ?????????????? ????????????:\n???????????? ???????????? ???????????? ???? 6 ?????????????? ?? ???????????? ???????????????? ????????????????????\n???????????? ???????????????????????? ???????????? (???????????? ?? ???????????? ????????) ???? $5 ???? ???????????? ?? ??????????????????????\n?????????????????????? ???? ?????????????? ???????????????? ???????? ??????????????????\n???????????? ???????????? ?????? ???????????? ?????????????? ??????????????????',
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
//         bot.sendMessage(msg.chat.id, `???????????????? ??????????:`, opts);
//     }
//     if (action === 'accNotExist') {
//         bot.sendMessage(
//             msg.chat.id,
//             `<a href='https://telegra.ph/Instrukciya-po-sozdaniyu-akkaunta-na-Binance-09-30'>?????????????????? ????????????????????</a>`,
//             { parse_mode: 'HTML' },
//         );
//     }
//     if (action.includes('/exchange')) {
//         const opts = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: '????', callback_data: '/usdt_exist' },
//                         { text: '??????', callback_data: '/usdt_not_exist' },
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
//                 inline_keyboard: [[{ text: '???????????? ????????????????', callback_data: '/balance' }]],
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
//         bot.sendMessage(msg.chat.id, '?????????????? ?????? api key', opts);
//     }
//     if (action === '/secret_key') {
//         const opts = {
//             reply_markup: {
//                 force_reply: true,
//             },
//         };
//         bot.sendMessage(msg.chat.id, '?????????????? ?????? api secret', opts);
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
//                 bot.sendMessage(msg.chat.id, '?????????????????? ???? ???????????? ?????? ????????????' + paymentUrl);
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
//         if (msg.reply_to_message.text === '?????????????? ?????? email ?????? ???????????? ????????????????') {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [[{ text: '????', callback_data: '/acc' }], [{ text: '??????', callback_data: 'accNotExist' }]],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, `???????? ???? ?? ?????? ?????????????? ???? ???????????????????????`, opts);
//         }
//         if (msg.reply_to_message.text === messages[6].a) {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [
//                             { text: '???????????? api key', callback_data: '/api_key' },
//                             { text: '???????????? api secret', callback_data: '/secret_key' },
//                         ],
//                     ],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, '???????????????? ?????????? ???? ????????????????????', opts);
//         }
//         if (msg.reply_to_message.text === '?????????????? ?????? api key') {
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [[{ text: '???????????? api secret', callback_data: '/secret_key' }]],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, 'Api key ????????????????', opts);
//         }
//         if (msg.reply_to_message.text === '?????????????? ?????? api secret') {
//             bot.sendMessage(msg.chat.id, 'Api secret ????????????????');
//             const opts = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Trial | ????????????', callback_data: '/trial' }],
//                         [{ text: 'PRO | ????????????', callback_data: '/pro' }],
//                     ],
//                 },
//             };
//             bot.sendMessage(msg.chat.id, `???????????????? ????????????????\n ???????????????? ???????????????? ?? ????????`, opts);
//         }
//     }
// });
