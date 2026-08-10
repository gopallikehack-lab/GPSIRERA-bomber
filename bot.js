// ============================================
// bot.js - Standalone Telegram Bot
// Run with: node bot.js
// ============================================

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const BOMBER_API = process.env.BOMBER_API || 'https://bomberx.onrender.com';

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
  back: '<tg-emoji emoji-id="5202160196750690611">🔙</tg-emoji>',
  home: '<tg-emoji emoji-id="6152454408576703503">🏠</tg-emoji>',
  stop: '<tg-emoji emoji-id="5787672468076367185">🛑</tg-emoji>',
  help: '<tg-emoji emoji-id="4967564745126183720">❓</tg-emoji>',
};

// ============ COMMANDS ============

bot.start(async (ctx) => {
  const user = ctx.from.first_name || 'User';
  const welcome = `
${EMOJIS.explosion} ${EMOJIS.bomb} ${EMOJIS.bomb2} ${EMOJIS.explosion}
<b>🔥 WELCOME TO SMS BOMBER BOT ${user}! 🔥</b>
${EMOJIS.wave} ${EMOJIS.phone} ${EMOJIS.call} ${EMOJIS.phone2}

${EMOJIS.gear} <b>Bot Features:</b>
• ${EMOJIS.bomb} SMS Bombing on any number
• ${EMOJIS.stop} Stop bombing anytime
• ${EMOJIS.chat} Real-time status updates
• ${EMOJIS.flower} 24/7 Active

${EMOJIS.cool} <b>Commands:</b>
/bomb &lt;phone&gt; - Start bombing
/stop - Stop bombing
/status - Check bombing status
/help - Show this menu

${EMOJIS.happy} <i>Made with ${EMOJIS.explosion} by DEVXOP</i>
  `;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(`${EMOJIS.bomb} 💣 Start Bombing`, 'bomb_start')],
    [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop Bombing`, 'bomb_stop')],
    [Markup.button.callback(`${EMOJIS.gear} ⚙️ Status`, 'bomb_status')],
    [Markup.button.callback(`${EMOJIS.help} ❓ Help`, 'help_menu')],
  ]);

  await ctx.reply(welcome, { parse_mode: 'HTML', ...keyboard });
});

bot.command('bomb', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply(`
${EMOJIS.sad} <b>Error:</b> Phone number required!

<b>Usage:</b> /bomb 9876543210
<b>Example:</b> /bomb 9768547976
    `, { parse_mode: 'HTML' });
  }

  const phone = args[1].replace(/[^0-9]/g, '');
  if (phone.length < 10) {
    return ctx.reply(`${EMOJIS.sad} <b>Invalid phone number!</b>`, { parse_mode: 'HTML' });
  }

  const statusMsg = await ctx.reply(`${EMOJIS.gear} ${EMOJIS.bomb} <b>Starting bomb on +${phone}...</b>`, { parse_mode: 'HTML' });

  try {
    const response = await axios.get(`${BOMBER_API}/bomb?phone=${phone}`, { timeout: 15000 });
    const result = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;

    await ctx.reply(`
${EMOJIS.explosion} <b>✅ BOMBING STARTED!</b> ${EMOJIS.explosion}
${EMOJIS.phone} <b>Target:</b> +${phone}
${EMOJIS.chat} <b>Status:</b> ✅ Active
${EMOJIS.wave} <b>Response:</b>
<code>${result}</code>
    `, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.stop} 🛑 STOP`, 'bomb_stop')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
      ]),
    });

    await ctx.deleteMessage(statusMsg.message_id);

  } catch (error) {
    await ctx.reply(`${EMOJIS.sad} <b>Error:</b> ${error.message}`, { parse_mode: 'HTML' });
    await ctx.deleteMessage(statusMsg.message_id);
  }
});

bot.command('stop', async (ctx) => {
  const msg = await ctx.reply(`${EMOJIS.gear} ${EMOJIS.stop} <b>Stopping...</b>`, { parse_mode: 'HTML' });
  try {
    const response = await axios.get(`${BOMBER_API}/stop`, { timeout: 10000 });
    const result = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;
    await ctx.reply(`
${EMOJIS.explosion} <b>✅ STOPPED!</b>
<code>${result}</code>
    `, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.bomb} 💣 New Bomb`, 'bomb_start')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
      ]),
    });
    await ctx.deleteMessage(msg.message_id);
  } catch (error) {
    await ctx.reply(`${EMOJIS.sad} <b>Error:</b> ${error.message}`, { parse_mode: 'HTML' });
  }
});

bot.command('status', async (ctx) => {
  await ctx.reply(`
${EMOJIS.gear} <b>📊 STATUS</b>
${EMOJIS.phone} API: ${BOMBER_API}
${EMOJIS.chat} Status: ✅ Online
${EMOJIS.flower} Emojis: ✅ Premium
${EMOJIS.cool} Bot: ✅ Active
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Bomb`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
    ]),
  });
});

bot.command('help', async (ctx) => {
  await ctx.reply(`
${EMOJIS.cool} <b>📖 HELP</b>
/bomb &lt;phone&gt; - Start
/stop - Stop
/status - Check
/help - This menu
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
    ]),
  });
});

// ============ INLINE BUTTONS ============

bot.action('bomb_start', async (ctx) => {
  await ctx.reply(`${EMOJIS.phone} Enter number: /bomb 9876543210`, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.back} 🔙 Back`, 'back_menu')],
    ]),
  });
  await ctx.answerCbQuery('🔓 Ready');
});

bot.action('bomb_stop', async (ctx) => {
  try {
    const response = await axios.get(`${BOMBER_API}/stop`, { timeout: 10000 });
    const result = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;
    await ctx.reply(`${EMOJIS.explosion} Stopped!\n<code>${result}</code>`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.bomb} 💣 New`, 'bomb_start')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
      ]),
    });
  } catch (error) {
    await ctx.reply(`${EMOJIS.sad} Error: ${error.message}`, { parse_mode: 'HTML' });
  }
  await ctx.answerCbQuery('🛑 Stopped');
});

bot.action('bomb_status', async (ctx) => {
  await ctx.reply(`
${EMOJIS.gear} Status: ✅ Online
${EMOJIS.phone} API: ${BOMBER_API}
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Bomb`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.back} 🔙 Back`, 'back_menu')],
    ]),
  });
  await ctx.answerCbQuery('📊 Status');
});

bot.action('help_menu', async (ctx) => {
  await ctx.reply(`
${EMOJIS.cool} Commands:
/bomb <phone>
/stop
/status
/help
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
    ]),
  });
  await ctx.answerCbQuery('❓ Help');
});

bot.action('back_menu', async (ctx) => {
  const user = ctx.from.first_name || 'User';
  await ctx.reply(`
${EMOJIS.explosion} <b>🔥 MAIN MENU</b>
${EMOJIS.phone} Welcome back, ${user}!
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Start`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.gear} ⚙️ Status`, 'bomb_status')],
      [Markup.button.callback(`${EMOJIS.help} ❓ Help`, 'help_menu')],
    ]),
  });
  await ctx.answerCbQuery('🏠 Menu');
});

// ============ START BOT ============

bot.launch().then(() => {
  console.log('🤖 Bot is running in standalone mode!');
  console.log(`📞 BOMBER_API: ${BOMBER_API}`);
}).catch((err) => {
  console.error('❌ Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
