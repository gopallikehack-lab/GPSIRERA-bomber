require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const express = require('express');

const app = express();
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

// ============ BOT COMMANDS ============

// START COMMAND
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
/bomb <phone> - Start bombing
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

  await ctx.reply(welcome, {
    parse_mode: 'HTML',
    ...keyboard,
  });
});

// BOMB COMMAND
bot.command('bomb', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply(`
${EMOJIS.sad} <b>Error:</b> Phone number required!

<b>Usage:</b> /bomb 9876543210
<b>Example:</b> /bomb 9768547976

${EMOJIS.wave} Make sure to include country code if needed.
    `, { parse_mode: 'HTML' });
  }

  const phone = args[1].replace(/[^0-9]/g, '');
  if (phone.length < 10) {
    return ctx.reply(`${EMOJIS.sad} <b>Invalid phone number!</b> Please enter a valid 10+ digit number.`, { parse_mode: 'HTML' });
  }

  const statusMsg = await ctx.reply(`${EMOJIS.gear} ${EMOJIS.bomb} <b>Starting bomb on +${phone}...</b>`, { parse_mode: 'HTML' });

  try {
    const response = await axios.get(`${BOMBER_API}/bomb?phone=${phone}`, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });

    const result = response.data;
    const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;

    const replyMsg = `
${EMOJIS.explosion} <b>✅ BOMBING STARTED!</b> ${EMOJIS.explosion}
${EMOJIS.phone} <b>Target:</b> +${phone}
${EMOJIS.chat} <b>Status:</b> ✅ Active
${EMOJIS.wave} <b>Response:</b> 
<code>${resultText}</code>

${EMOJIS.stop} Use /stop to halt bombing
    `;

    await ctx.reply(replyMsg, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.stop} 🛑 STOP BOMBING`, 'bomb_stop')],
        [Markup.button.callback(`${EMOJIS.gear} 📊 Status`, 'bomb_status')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Back to Menu`, 'back_menu')],
      ]),
    });

    await ctx.deleteMessage(statusMsg.message_id);

  } catch (error) {
    await ctx.reply(`
${EMOJIS.sad} <b>❌ ERROR!</b> ${EMOJIS.sad}
${EMOJIS.wave} <b>Could not start bombing.</b>
${EMOJIS.gear} <b>Error:</b> ${error.message}

Check if the API is online or try again later.
    `, { parse_mode: 'HTML' });
    await ctx.deleteMessage(statusMsg.message_id);
  }
});

// STOP COMMAND
bot.command('stop', async (ctx) => {
  const msg = await ctx.reply(`${EMOJIS.gear} ${EMOJIS.stop} <b>Stopping all bombings...</b>`, { parse_mode: 'HTML' });

  try {
    const response = await axios.get(`${BOMBER_API}/stop`, { 
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = response.data;
    const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;

    await ctx.reply(`
${EMOJIS.explosion} <b>✅ BOMBING STOPPED!</b> ${EMOJIS.explosion}
${EMOJIS.chat} <b>Status:</b> ⛔ Stopped
${EMOJIS.wave} <b>Response:</b>
<code>${resultText}</code>

${EMOJIS.flower} <i>Thank you for using the bot!</i>
    `, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.bomb} 💣 Start New Bomb`, 'bomb_start')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Back to Menu`, 'back_menu')],
      ]),
    });

    await ctx.deleteMessage(msg.message_id);

  } catch (error) {
    await ctx.reply(`
${EMOJIS.sad} <b>❌ Could not stop bombing.</b>
${EMOJIS.gear} <b>Error:</b> ${error.message}
    `, { parse_mode: 'HTML' });
    await ctx.deleteMessage(msg.message_id);
  }
});

// STATUS COMMAND
bot.command('status', async (ctx) => {
  await ctx.reply(`
${EMOJIS.gear} <b>📊 BOT STATUS</b> ${EMOJIS.gear}
${EMOJIS.phone} <b>API:</b> ${BOMBER_API}
${EMOJIS.chat} <b>Status:</b> ${EMOJIS.explosion} Online
${EMOJIS.wave} <b>Uptime:</b> 24/7
${EMOJIS.flower} <b>Premium Emojis:</b> ✅ Loaded
${EMOJIS.cool} <b>Version:</b> 2.0.0

${EMOJIS.bomb} <b>Ready to bomb!</b>
  `, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`${EMOJIS.bomb} 💣 Start Bomb`, 'bomb_start')],
      [Markup.button.callback(`${EMOJIS.stop} 🛑 Stop Bomb`, 'bomb_stop')],
      [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
    ]),
  });
});

// HELP COMMAND
bot.command('help', async (ctx) => {
  await ctx.reply(`
${EMOJIS.cool} <b>📖 HELP MENU</b> ${EMOJIS.cool}

${EMOJIS.bomb} <b>Commands:</b>
/bomb &lt;phone&gt; - Start SMS bombing on target
/stop - Stop all active bombing sessions
/status - Check bot and API status
/help - Show this menu

${EMOJIS.gear} <b>How to use:</b>
1. Type /bomb 9876543210
2. Wait for confirmation
3. Use /stop to cancel

${EMOJIS.chat} <b>Inline Buttons:</b>
Use the buttons below for quick actions!

${EMOJIS.flower} <i>Made with love by DEVXOP</i>
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
${EMOJIS.phone} <b>📞 Enter phone number:</b>
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
  await ctx.reply(`${EMOJIS.gear} ${EMOJIS.stop} <b>Stopping...</b>`, { parse_mode: 'HTML' });
  try {
    const response = await axios.get(`${BOMBER_API}/stop`, { timeout: 10000 });
    const result = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;
    
    await ctx.reply(`
${EMOJIS.explosion} <b>✅ STOPPED!</b> ${EMOJIS.explosion}
${EMOJIS.wave} <code>${result}</code>
    `, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(`${EMOJIS.bomb} 💣 New Bomb`, 'bomb_start')],
        [Markup.button.callback(`${EMOJIS.home} 🏠 Menu`, 'back_menu')],
      ]),
    });
  } catch (error) {
    await ctx.reply(`${EMOJIS.sad} <b>Error:</b> ${error.message}`, { parse_mode: 'HTML' });
  }
  await ctx.answerCbQuery('🛑 Stopped!');
});

bot.action('bomb_status', async (ctx) => {
  await ctx.reply(`
${EMOJIS.gear} <b>📊 STATUS</b> ${EMOJIS.gear}
${EMOJIS.phone} <b>API:</b> ${BOMBER_API}
${EMOJIS.chat} <b>Status:</b> ✅ Online
${EMOJIS.flower} <b>Emojis:</b> ✅ Premium
${EMOJIS.cool} <b>Bot:</b> ✅ Active
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
${EMOJIS.cool} <b>📖 Help Menu</b>
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
  await ctx.answerCbQuery('❓ Help opened');
});

bot.action('back_menu', async (ctx) => {
  const user = ctx.from.first_name || 'User';
  await ctx.reply(`
${EMOJIS.explosion} <b>🔥 MAIN MENU</b> ${EMOJIS.explosion}
${EMOJIS.phone} <b>Welcome back, ${user}!</b> ${EMOJIS.phone}

${EMOJIS.bomb} <b>Choose an option:</b>
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
app.use(bot.webhookCallback('/api/webhook'));

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
