require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// ============ PREMIUM EMOJIS ============
const EMOJIS = {
  bomb: '<tg-emoji emoji-id="5280569974404966639">💣</tg-emoji>',
  bomb2: '<tg-emoji emoji-id="5233611825647480104">💣</tg-emoji>',
  explosion: '<tg-emoji emoji-id="6325767939676964769">💥</tg-emoji>',
  phone: '<tg-emoji emoji-id="5211130510826285018">☎️</tg-emoji>',
  gear: '<tg-emoji emoji-id="5787672468076367185">⚙️</tg-emoji>',
  call: '<tg-emoji emoji-id="5202160196750690611">📞</tg-emoji>',
  wave: '<tg-emoji emoji-id="4967564745126183720">〰️</tg-emoji>',
  phone2: '<tg-emoji emoji-id="5197164531310147314">☎️</tg-emoji>',
  chat: '<tg-emoji emoji-id="5954224165874569584">💬</tg-emoji>',
  happy: '<tg-emoji emoji-id="6262806154364063018">😁</tg-emoji>',
  sad: '<tg-emoji emoji-id="6152443958921271508">🥲</tg-emoji>',
  flower: '<tg-emoji emoji-id="6152454408576703503">🌸</tg-emoji>',
  cool: '<tg-emoji emoji-id="6300743441575844780">😎</tg-emoji>',
};

const BOMBER_API = process.env.BOMBER_API || 'https://bomberx.onrender.com';

// ============ BOT COMMANDS ============

// Start command
bot.start(async (ctx) => {
  const user = ctx.from.first_name;
  const welcome = `
${EMOJIS.explosion} ${EMOJIS.bomb} ${EMOJIS.bomb2} ${EMOJIS.explosion}
*🔥 WELCOME TO SMS BOMBER BOT ${user}!* 🔥
${EMOJIS.wave} ${EMOJIS.phone} ${EMOJIS.call} ${EMOJIS.phone2}

${EMOJIS.gear} *Bot Features:*
• ${EMOJIS.bomb} SMS Bombing on any number
• ${EMOJIS.stop} Stop bombing anytime
• ${EMOJIS.chat} Real-time status updates
• ${EMOJIS.flower} 24/7 Active

${EMOJIS.cool} *Commands:*
/bomb <phone> - Start bombing
/stop - Stop bombing
/status - Check bombing status
/help - Show this menu

${EMOJIS.happy} *Made with ${EMOJIS.explosion} by DEVXOP*
  `;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(`${EMOJIS.bomb} Start Bombing 💣`, 'bomb_start')],
    [Markup.button.callback(`${EMOJIS.stop} Stop Bombing 🛑`, 'bomb_stop')],
    [Markup.button.callback(`${EMOJIS.gear} Status ⚙️`, 'bomb_status')],
    [Markup.button.callback(`${EMOJIS.help} Help ❓`, 'help_menu')],
  ]);

  await ctx.reply(welcome, {
    parse_mode: 'HTML',
    ...keyboard,
  });
});

// ============ BOMB COMMAND ============

bot.command('bomb', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply(`
${EMOJIS.sad} *Error:* Phone number required!

*Usage:* /bomb 9876543210
*Example:* /bomb 9768547976

${EMOJIS.wave} Make sure to include country code if needed.
    `, { parse_mode: 'HTML' });
  }

  const phone = args[1].replace(/[^0-9]/g, '');
  if (phone.length < 10) {
    return ctx.reply(`${EMOJIS.sad} *Invalid phone number!* Please enter a valid 10+ digit number.`, { parse_mode: 'HTML' });
  }

  await ctx.reply(`${EMOJIS.gear} ${EMOJIS.bomb} *Starting bomb on +${phone}...*`, { parse_mode: 'HTML' });

  try {
    const response = await axios.get(`${BOMBER_API}/bomb?phone=${phone}`, {
      timeout: 15000,
    });

    const result = response.data;
    const statusMsg = `
${EMOJIS.explosion} *BOMBING STARTED!* ${EMOJIS.explosion}
${EMOJIS.phone} *Target:* +${phone}
${EMOJIS.chat} *Status:* ✅ Active
${EMOJIS.wave} *Response:* ${JSON.stringify(result, null, 2)}

${EMOJIS.stop} Use /stop to halt bombing
    `;

    await ctx.reply(statusMsg, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.stop} 🛑 STOP BOMBING`, 'bomb_stop')],
        [Markup.button.callback(`${EMOJIS.gear} 📊 Status`, 'bomb_status')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Back to Menu`, 'back_menu')],
      ]),
    });

  } catch (error) {
    await ctx.reply(`
${EMOJIS.sad} *ERROR!* ${EMOJIS.sad}
${EMOJIS.wave} *Could not start bombing.*
${EMOJIS.gear} *Error:* ${error.message}

Check if the API is online or try again later.
    `, { parse_mode: 'HTML' });
  }
});

// ============ STOP COMMAND ============

bot.command('stop', async (ctx) => {
  await ctx.reply(`${EMOJIS.gear} ${EMOJIS.stop} *Stopping all bombings...*`, { parse_mode: 'HTML' });

  try {
    const response = await axios.get(`${BOMBER_API}/stop`, { timeout: 10000 });
    
    await ctx.reply(`
${EMOJIS.explosion} *BOMBING STOPPED!* ${EMOJIS.explosion}
${EMOJIS.chat} *Status:* ⛔ Stopped
${EMOJIS.wave} *Response:* ${JSON.stringify(response.data, null, 2)}

${EMOJIS.flower} *Thank you for using the bot!*
    `, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.bomb} 💣 Start New Bomb`, 'bomb_start')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Back to Menu`, 'back_menu')],
      ]),
    });

  } catch (error) {
    await ctx.reply(`
${EMOJIS.sad} *Could not stop bombing.*
${EMOJIS.gear} *Error:* ${error.message}
    `, { parse_mode: 'HTML' });
  }
});

// ============ STATUS COMMAND ============

bot.command('status', async (ctx) => {
  await ctx.reply(`
${EMOJIS.gear} *BOT STATUS* ${EMOJIS.gear}
${EMOJIS.phone} *API:* ${BOMBER_API}
${EMOJIS.chat} *Status:* ${EMOJIS.explosion} Online
${EMOJIS.wave} *Uptime:* 24/7
${EMOJIS.flower} *Premium Emojis:* ✅ Loaded
${EMOJIS.cool} *Version:* 2.0.0

${EMOJIS.bomb} *Ready to bomb!*
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Start Bomb`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop Bomb`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
    ]),
  });
});

// ============ HELP COMMAND ============

bot.command('help', async (ctx) => {
  await ctx.reply(`
${EMOJIS.cool} *📖 HELP MENU* ${EMOJIS.cool}

${EMOJIS.bomb} *Commands:*
/bomb <phone> - Start SMS bombing on target
/stop - Stop all active bombing sessions
/status - Check bot and API status
/help - Show this menu

${EMOJIS.gear} *How to use:*
1. Type /bomb 9876543210
2. Wait for confirmation
3. Use /stop to cancel

${EMOJIS.chat} *Inline Buttons:*
Use the buttons below for quick actions!

${EMOJIS.flower} *Made with love by DEVXOP*
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Start Bomb`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop Bomb`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.home} 🏠 Home`, 'back_menu')],
    ]),
  });
});

// ============ INLINE BUTTON HANDLERS ============

bot.action('bomb_start', async (ctx) => {
  await ctx.reply(`
${EMOJIS.phone} *📞 Enter phone number:*
${EMOJIS.wave} Format: 9876543210

Example: /bomb 9768547976
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.back} 🔙 Back to Menu`, 'back_menu')],
    ]),
  });
  await ctx.answerCbQuery('🔓 Ready to bomb!');
});

bot.action('bomb_stop', async (ctx) => {
  await ctx.reply(`${EMOJIS.gear} ${EMOJIS.stop} *Stopping...*`, { parse_mode: 'HTML' });
  try {
    const response = await axios.get(`${BOMBER_API}/stop`, { timeout: 10000 });
    await ctx.reply(`
${EMOJIS.explosion} *✅ STOPPED!* ${EMOJIS.explosion}
${EMOJIS.wave} ${JSON.stringify(response.data, null, 2)}
    `, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.bomb} 💣 New Bomb`, 'bomb_start')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
      ]),
    });
  } catch (error) {
    await ctx.reply(`${EMOJIS.sad} *Error:* ${error.message}`, { parse_mode: 'HTML' });
  }
  await ctx.answerCbQuery('🛑 Stopped!');
});

bot.action('bomb_status', async (ctx) => {
  await ctx.reply(`
${EMOJIS.gear} *📊 STATUS* ${EMOJIS.gear}
${EMOJIS.phone} *API:* ${BOMBER_API}
${EMOJIS.chat} *Status:* ✅ Online
${EMOJIS.flower} *Emojis:* ✅ Premium
${EMOJIS.cool} *Bot:* ✅ Active
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Bomb`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.back} 🔙 Back`, 'back_menu')],
    ]),
  });
  await ctx.answerCbQuery('📊 Status fetched!');
});

bot.action('help_menu', async (ctx) => {
  await ctx.reply(`
${EMOJIS.cool} *Help Menu*
/bomb <phone> - Start
/stop - Stop
/status - Check
/help - This menu
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
    ]),
  });
  await ctx.answerCbQuery('❓ Help opened');
});

bot.action('back_menu', async (ctx) => {
  const user = ctx.from.first_name;
  await ctx.reply(`
${EMOJIS.explosion} *🔥 MAIN MENU* ${EMOJIS.explosion}
${EMOJIS.phone} *Welcome back, ${user}!* ${EMOJIS.phone}

${EMOJIS.bomb} *Choose an option:*
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Start Bombing`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop Bombing`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.gear} ⚙️ Status`, 'bomb_status')],
      [Markup.button.callback(`${EMOJIS.help} ❓ Help`, 'help_menu')],
    ]),
  });
  await ctx.answerCbQuery('🏠 Back to menu');
});

// ============ WEBHOOK SETUP ============

app.use(express.json());
app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

// Health check endpoint
app.get('/', (req, res) => {
  res.send(`
${EMOJIS.explosion} Telegram Bomber Bot is running! ${EMOJIS.bomb}
${EMOJIS.phone} API: ${BOMBER_API}
${EMOJIS.flower} Status: Online
  `);
});

// Export for Vercel
module.exports = app;
