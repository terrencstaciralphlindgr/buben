const opts = {
  '/start': {
    reply_markup: {
      keyboard: [['Start'], ['Поддержка', 'FAQ']],
      resize_keyboard: true,
    },
  },
  Start: {
    reply_markup: {
      keyboard: [['Начать торговлю'], ['Поддержка', 'FAQ']],
      resize_keyboard: true,
    },
  },
  choose_exchange: {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Да', callback_data: '/exchange_yes' },
          { text: 'Нет', callback_data: '/exchange_no' },
        ],
      ],
    },
  },
  choose_plan: {
    reply_markup: {
      inline_keyboard: [[{ text: 'Trial', callback_data: '/trial' }]],
    },
  },
};

export default opts;
