const TelegramBot = require('node-telegram-bot-api');
const Parser = require('rss-parser');
const fetch = require('node-fetch');

const BB_API = 'https://be.buenbit.com/api/market/tickers/';
const BB_BLOG = 'https://buenbit.com/blog/';
const ETHGASSTATION_API = 'https://ethgasstation.info/api/ethgasAPI.json';
const TELEGRAM_BOT_TOKEN = '';
const ETHGASSTATION_API_KEY = '';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {polling: true});
const parser = new Parser();

bot.onText(/\/par (.+)/, (msg, match) => {
  let resp = 'Par no encontrado';

  fetch(BB_API)
    .then(response => response.json())
    .then(data => {
      switch (match[1]) {
        case 'daiars':
        case 'arsdai':
          resp = `Comprás DAI a ${data.object.daiars.selling_price} ARS\n`;
          resp += `Vendés DAI a ${data.object.daiars.purchase_price} ARS`;
          break;
        case 'daiusd':
        case 'usddai':
          resp = `Comprás DAI a ${data.object.daiusd.selling_price} USD\n`;
          resp += `Vendés DAI a ${data.object.daiusd.purchase_price} USD`;
          break;
        case 'btcars':
        case 'arsbtc':
          resp = `Comprás BTC a ${data.object.btcars.selling_price} ARS\n`;
          resp += `Vendés BTC a ${data.object.btcars.purchase_price} ARS`;
          break;
      }
     })
    .then(() => {
      bot.sendMessage(msg.chat.id, resp);
    });
});

bot.onText(/\/blog (.+)/, async (msg, match) => {
  let feed = await parser.parseURL(`${BB_BLOG_RSS}?s=${match[1]}&feed=rss2`);
  let resp = [];

  feed.items.forEach(item => {
    resp.push(`- [${item.title}](${item.link})`);
  });

  if (resp.length) {
    bot.sendMessage(msg.chat.id, resp.join('\n'), {parse_mode: 'markdown'});
  }
});

bot.onText(/\/gas/, async (msg) => {
  let resp;
  fetch(`${ETHGASSTATION_API}?api-key=${ETHGASSTATION_API_KEY}`)
    .then(response => response.json())
    .then(data => {
      resp = `Fast: ${data.fast/10} gwei\n`;
      resp += `Average: ${data.average/10} gwei\n`;
      resp += `Safe Low: ${data.safeLow/10} gwei`;

      bot.sendMessage(msg.chat.id, resp, {parse_mode: 'markdown'});
    });
});