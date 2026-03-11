/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  economy_v1      ┃
┃ Commands: balance daily work shop      ┃
┃           leaderboard                  ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';

const START_COINS=500,DAILY_REWARD=100,WORK_MIN=20,WORK_MAX=80;
const wallet=new Map(),lastClaim=new Map(),lastWork=new Map();

function getWallet(jid){if(!wallet.has(jid))wallet.set(jid,{coins:START_COINS,bank:0,level:1,xp:0,dailyStreak:0,joinedAt:new Date().toLocaleDateString('en-PK')});return wallet.get(jid);}
function addCoins(jid,n){const w=getWallet(jid);w.coins=Math.max(0,w.coins+n);return w;}
function getLevelName(l){const ls={1:'Beginner 🌱',2:'Rookie 🌿',3:'Player 🎮',4:'Gamer 🕹️',5:'Pro 🏆',6:'Elite ⭐',7:'Master 💎',8:'Legend 👑'};return ls[Math.min(l,8)]||'Legend 👑';}

async function balanceHandler({sock,msg,from,sender}) {
  try {
    await msg.react('💰');
    const target=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||sender;
    const num=target.split('@')[0]; const isSelf=target===sender;
    const w=getWallet(target); const total=w.coins+w.bank;
    const barFill=Math.min(10,Math.round((w.coins/5000)*10)); const bar='█'.repeat(barFill)+'░'.repeat(10-barFill);
    await sock.sendMessage(from,{text:`╭━━━『 💰 *WALLET* 』━━━╮\n\n${isSelf?'👤 *Your Wallet*':`👤 *@${num}'s Wallet*`}\n\n╭─『 💳 *Balance* 』\n│ 💰 *Coins:*  ${w.coins.toLocaleString()}\n│ 🏦 *Bank:*   ${w.bank.toLocaleString()}\n│ 💎 *Total:*  ${total.toLocaleString()}\n│ 📊 ${bar}\n╰──────────────────────────\n\n╭─『 📊 *Profile* 』\n│ ⭐ *Level:*  ${w.level} — ${getLevelName(w.level)}\n│ 📅 *Since:*  ${w.joinedAt}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[target]},{quoted:msg});
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function dailyHandler({sock,msg,from,sender}) {
  try {
    await msg.react('🎁');
    const now=Date.now(); const last=lastClaim.get(sender)||0; const remaining=24*60*60*1000-(now-last);
    const num=sender.split('@')[0];
    if (remaining>0) {
      const h=Math.floor(remaining/3600000),m=Math.floor((remaining%3600000)/60000);
      return sock.sendMessage(from,{text:`╭━━━『 ⏰ *DAILY COOLDOWN* 』━━━╮\n\n👋 *Player:* +${num}\n⏳ *Come back in:* ${h}h ${m}m\n💡 *Next reward:* ${DAILY_REWARD} coins\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    }
    const w=getWallet(sender); const streak=(w.dailyStreak||0)+1; w.dailyStreak=streak;
    const streakBonus=Math.min(streak-1,7)*20; const total=DAILY_REWARD+streakBonus;
    lastClaim.set(sender,now); addCoins(sender,total);
    const streakBar='🔥'.repeat(Math.min(streak,7))+'⬜'.repeat(Math.max(0,7-streak));
    await sock.sendMessage(from,{text:`╭━━━『 🎁 *DAILY REWARD!* 』━━━╮\n\n👋 *Player:* +${num}\n\n╭─『 💰 *Reward* 』\n│ 🎁 *Base:*   +${DAILY_REWARD} coins\n│ 🔥 *Streak:* +${streakBonus} coins\n│ 💰 *Total:*  +${total} coins\n│ 💳 *Balance:* ${w.coins.toLocaleString()} coins\n╰──────────────────────────\n\n🔥 *Streak:* ${streak} days\n${streakBar}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react('✅');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

const WORK_JOBS=['Software Engineer 💻','Teacher 📚','Doctor 🏥','Driver 🚗','Chef 👨‍🍳','Farmer 🌾','Writer ✍️','Mechanic 🔧'];
async function workHandler({sock,msg,from,sender}) {
  try {
    await msg.react('💼');
    const now=Date.now(); const last=lastWork.get(sender)||0; const remaining=60*60*1000-(now-last);
    const num=sender.split('@')[0];
    if (remaining>0) {
      const m=Math.floor(remaining/60000); const s=Math.floor((remaining%60000)/1000);
      return sock.sendMessage(from,{text:`╭━━━『 ⏰ *WORK COOLDOWN* 』━━━╮\n\n💤 *Rest, +${num}!*\n⏳ *Next work in:* ${m}m ${s}s\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    }
    const earned=Math.floor(Math.random()*(WORK_MAX-WORK_MIN+1))+WORK_MIN;
    const isBonus=Math.random()<0.1; const bonus=isBonus?Math.floor(earned*0.5):0; const total=earned+bonus;
    const job=WORK_JOBS[Math.floor(Math.random()*WORK_JOBS.length)];
    lastWork.set(sender,now); addCoins(sender,total);
    await sock.sendMessage(from,{text:`╭━━━『 💼 *WORK REPORT* 』━━━╮\n\n👷 *+${num} worked as:*\n${job}\n\n╭─『 💵 *Payment* 』\n│ 💵 *Base Pay:*  +${earned} coins\n${isBonus?`│ 🎉 *Bonus:*     +${bonus} coins\n`:''}│ 💰 *Total:*    +${total} coins\n│ 💳 *Balance:*  ${getWallet(sender).coins.toLocaleString()} coins\n╰──────────────────────────\n\n⏰ Next work: 1 hour\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react('✅');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

const SHOP_ITEMS=[
  {id:1,name:'Lucky Charm 🍀',price:200,desc:'10% more coins for 1 hour'},
  {id:2,name:'Double XP 📈',price:300,desc:'Double XP for 2 hours'},
  {id:3,name:'Gold Shield 🛡️',price:500,desc:'Protection from robbery'},
  {id:4,name:'VIP Pass 💎',price:1000,desc:'Skip all cooldowns for 1 hour'},
  {id:5,name:'Mystery Box 📦',price:150,desc:'Random reward (50-500 coins)'},
];
async function shopHandler({sock,msg,from,sender,args}) {
  try {
    await msg.react('🛒');
    if (args?.length&&!isNaN(parseInt(args[0]))) {
      const itemId=parseInt(args[0]); const item=SHOP_ITEMS.find(i=>i.id===itemId);
      if (!item) return msg.reply(`❌ Item not found! Use .shop to see items.\n${SYSTEM.SHORT_WATERMARK}`);
      const w=getWallet(sender);
      if (w.coins<item.price) return sock.sendMessage(from,{text:`❌ *Not enough coins!*\n\n💰 *You have:* ${w.coins} coins\n💵 *Item costs:* ${item.price} coins\n📉 *Need:* ${item.price-w.coins} more\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
      addCoins(sender,-item.price);
      if (item.id===5) { const reward=Math.floor(Math.random()*451)+50; addCoins(sender,reward); return sock.sendMessage(from,{text:`╭━━━『 📦 *MYSTERY BOX* 』━━━╮\n\n🎉 You opened the box!\n💰 *Reward:* +${reward} coins!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg}); }
      return sock.sendMessage(from,{text:`✅ *Purchased!*\n${item.name}\n💰 Balance: ${getWallet(sender).coins} coins\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    }
    const list=SHOP_ITEMS.map(i=>`│ ${i.id}. *${i.name}* — ${i.price} coins\n│    ${i.desc}`).join('\n│\n');
    await sock.sendMessage(from,{text:`╭━━━『 🛒 *SHOP* 』━━━╮\n\n💰 *Your balance:* ${getWallet(sender).coins} coins\n\n${list}\n\n💡 *.shop 1* to buy item #1\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function leaderboardHandler({sock,msg,from}) {
  try {
    await msg.react('🏆');
    const entries=[...wallet.entries()].sort((a,b)=>(b[1].coins+b[1].bank)-(a[1].coins+a[1].bank)).slice(0,10);
    if (!entries.length) return msg.reply(`📊 *No players yet! Use .daily or .work to start.*\n${SYSTEM.SHORT_WATERMARK}`);
    const medals=['🥇','🥈','🥉'];
    const list=entries.map(([j,w],i)=>`│ ${medals[i]||`${i+1}.`} +${j.split('@')[0]}\n│    💰 ${(w.coins+w.bank).toLocaleString()} coins`).join('\n│\n');
    await sock.sendMessage(from,{text:`╭━━━『 🏆 *LEADERBOARD* 』━━━╮\n\n👥 *Top ${entries.length} Players*\n\n${list}\n\n💡 .balance — Check your coins\n💡 .work — Earn coins\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['balance'],    name:'balance',    category:'Economy',description:'Check wallet balance',usage:'.balance [@user]',cooldown:3,handler:balanceHandler},
  {command:['daily'],      name:'daily',      category:'Economy',description:'Claim daily reward',usage:'.daily',cooldown:3,handler:dailyHandler},
  {command:['work'],       name:'work',       category:'Economy',description:'Work to earn coins',usage:'.work',cooldown:3,handler:workHandler},
  {command:['shop'],       name:'shop',       category:'Economy',description:'Buy items from shop',usage:'.shop [id]',cooldown:3,handler:shopHandler},
  {command:['leaderboard'],name:'leaderboard',category:'Economy',description:'Top players ranking',usage:'.leaderboard',cooldown:5,handler:leaderboardHandler},
];
