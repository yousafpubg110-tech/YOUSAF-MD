/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  game_v1         ┃
┃  Commands: dice coin quiz math         ┃
┃            tictactoe                   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';

const DICE_FACES=['⚀','⚁','⚂','⚃','⚄','⚅'];
const userStats=new Map();
const mathGames=new Map();
const tttGames=new Map();

// ─── dice ─────────────────────────────────────────────────────────────────────
async function diceHandler({sock,msg,from,sender,text}) {
  try {
    await msg.react('🎲');
    const senderNum=sender?.split('@')[0]||'User'; const input=(text||'').trim().toLowerCase();
    if (input==='vs'||input==='battle') {
      const pRoll=Math.floor(Math.random()*6)+1; const bRoll=Math.floor(Math.random()*6)+1;
      const result=pRoll>bRoll?'🏆 *You Win!*':pRoll<bRoll?'💀 *Bot Wins!*':'🤝 *Draw!';
      return sock.sendMessage(from,{text:`╭━━━『 🎲 *DICE BATTLE* 』━━━╮\n\n👤 *Your Roll:* ${DICE_FACES[pRoll-1]} (${pRoll})\n🤖 *Bot Roll:*  ${DICE_FACES[bRoll-1]} (${bRoll})\n\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    }
    const sides=Math.min(parseInt(input)||6,100); const result=Math.floor(Math.random()*sides)+1;
    const face=sides===6?DICE_FACES[result-1]:`[${result}]`;
    await sock.sendMessage(from,{text:`╭━━━『 🎲 *DICE ROLL* 』━━━╮\n\n👋 *Rolled by:* +${senderNum}\n\n      ${face}\n   *Result: ${result}/${sides}*\n\n${result===sides?'🎉 *Maximum Roll!*':result===1?'💀 *Minimum Roll!*':''}\n\n💡 .dice vs — Battle bot\n💡 .dice 20 — D20 roll\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react(result===sides?'🎉':'🎲');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── coin ─────────────────────────────────────────────────────────────────────
async function coinHandler({sock,msg,from,sender,text}) {
  try {
    await msg.react('🪙');
    const senderNum=sender?.split('@')[0]||'User'; const input=(text||'').trim().toLowerCase();
    if (input==='stats') {
      const s=userStats.get(sender)||{heads:0,tails:0}; const total=s.heads+s.tails;
      return sock.sendMessage(from,{text:`╭━━━『 📊 *COIN STATS* 』━━━╮\n\n👤 +${senderNum}\n🪙 *Total Flips:* ${total}\n⬆️ *Heads:* ${s.heads} (${total>0?Math.round(s.heads/total*100):0}%)\n⬇️ *Tails:* ${s.tails} (${total>0?Math.round(s.tails/total*100):0}%)\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    }
    const prediction=input.includes('head')?'heads':input.includes('tail')?'tails':null;
    const result=Math.random()<0.5?'heads':'tails'; const isH=result==='heads';
    if (!userStats.has(sender)) userStats.set(sender,{heads:0,tails:0});
    const s=userStats.get(sender); if (isH) s.heads++; else s.tails++;
    const predMsg=prediction?(prediction===result?'✅ *Correct! +15 coins*':'❌ *Wrong! -5 coins*'):'';
    await sock.sendMessage(from,{text:`╭━━━『 🪙 *COIN FLIP* 』━━━╮\n\n👋 *Flipped by:* +${senderNum}\n\n      ${isH?'🌟 ⬆️ HEADS 🌟':'💫 ⬇️ TAILS 💫'}\n\n${predMsg?`🎯 *Prediction:* ${predMsg}\n\n`:''}💡 .coin heads — Predict\n💡 .coin stats — Your stats\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react(isH?'⬆️':'⬇️');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── quiz ─────────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS=[
  {q:'Pakistan ka capital city kya hai?',a:'islamabad',options:['Lahore','Islamabad','Karachi','Peshawar']},
  {q:'Islam mein namaz kitni martaba farz hai roz?',a:'5',options:['3','4','5','7']},
  {q:'Pakistan kab azad hua?',a:'1947',options:['1945','1946','1947','1948']},
  {q:'Quran mein kitni surahs hain?',a:'114',options:['99','112','113','114']},
  {q:'Pakistan ka national sport kya hai?',a:'hockey',options:['Cricket','Football','Hockey','Kabaddi']},
  {q:'Allama Iqbal ka poora naam kya tha?',a:'muhammad iqbal',options:['Iqbal Ahmed','Muhammad Iqbal','Allama Iqbal','Dr. Iqbal']},
];
const activeQuizzes=new Map();
async function quizHandler({sock,msg,from,sender,text}) {
  try {
    const input=(text||'').trim().toLowerCase();
    // Check answer
    if (activeQuizzes.has(from)) {
      const quiz=activeQuizzes.get(from);
      if (input===quiz.a||input.includes(quiz.a)) {
        activeQuizzes.delete(from);
        return sock.sendMessage(from,{text:`✅ *CORRECT!* 🎉\n\n👤 @${sender?.split('@')[0]} won!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[sender]},{quoted:msg});
      }
    }
    await msg.react('❓');
    const q=QUIZ_QUESTIONS[Math.floor(Math.random()*QUIZ_QUESTIONS.length)];
    activeQuizzes.set(from,q);
    setTimeout(()=>activeQuizzes.delete(from),30000);
    const optList=q.options.map((o,i)=>`│ ${i+1}. ${o}`).join('\n');
    await sock.sendMessage(from,{text:`╭━━━『 ❓ *QUIZ TIME!* 』━━━╮\n\n❓ *${q.q}*\n\n${optList}\n\n⏱️ *30 seconds to answer!*\nType your answer below!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── math ─────────────────────────────────────────────────────────────────────
const activeMath=new Map();
async function mathHandler({sock,msg,from,sender,text}) {
  try {
    const input=(text||'').trim();
    if (activeMath.has(from)) {
      const game=activeMath.get(from);
      if (parseInt(input)===game.answer) {
        activeMath.delete(from);
        const time=((Date.now()-game.start)/1000).toFixed(1);
        return sock.sendMessage(from,{text:`✅ *CORRECT!* 🎉\n\n👤 @${sender?.split('@')[0]} solved it in ${time}s!\n💰 +${game.coins} coins!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[sender]},{quoted:msg});
      } else if (input&&!isNaN(parseInt(input))) {
        return msg.reply(`❌ Wrong answer! Try again!\n${SYSTEM.SHORT_WATERMARK}`);
      }
    }
    await msg.react('🧮');
    const ops=['+','-','*']; const op=ops[Math.floor(Math.random()*ops.length)];
    const a=Math.floor(Math.random()*50)+1; const b=Math.floor(Math.random()*20)+1;
    const answer=op==='+'?a+b:op==='-'?a-b:a*b;
    const coins=Math.floor(Math.random()*30)+10;
    activeMath.set(from,{answer,coins,start:Date.now()});
    setTimeout(()=>activeMath.delete(from),30000);
    await sock.sendMessage(from,{text:`╭━━━『 🧮 *MATH CHALLENGE* 』━━━╮\n\n❓ *What is:*\n\n      *${a} ${op} ${b} = ?*\n\n⏱️ 30 seconds!\n💰 Prize: ${coins} coins!\n\nType your answer!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── tictactoe ────────────────────────────────────────────────────────────────
function renderBoard(b){return `╭─────────╮\n│ ${b[0]}│${b[1]}│${b[2]} │\n│─┼─┼─│\n│ ${b[3]}│${b[4]}│${b[5]} │\n│─┼─┼─│\n│ ${b[6]}│${b[7]}│${b[8]} │\n╰─────────╯`;}
function checkWin(b,p){const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return wins.some(([a,c,d])=>b[a]===p&&b[c]===p&&b[d]===p);}
async function tttHandler({sock,msg,from,sender,text}) {
  try {
    const input=(text||'').trim().toLowerCase(); const senderNum=sender?.split('@')[0]||'User';
    if (input==='start'||input==='new') {
      const board=['1','2','3','4','5','6','7','8','9'];
      tttGames.set(from,{board,player:sender});
      return sock.sendMessage(from,{text:`╭━━━『 ❌⭕ *TIC TAC TOE* 』━━━╮\n\n👤 You are: ❌\n🤖 Bot is: ⭕\n\n${renderBoard(board)}\n\nType 1-9 to place your mark!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    }
    const game=tttGames.get(from);
    if (!game) return msg.reply(`❌ No active game! Type *.tictactoe start*\n${SYSTEM.SHORT_WATERMARK}`);
    const pos=parseInt(input)-1;
    if (isNaN(pos)||pos<0||pos>8) return msg.reply(`❌ Enter a number 1-9!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!['1','2','3','4','5','6','7','8','9'].includes(game.board[pos])) return msg.reply(`❌ That spot is taken!\n${SYSTEM.SHORT_WATERMARK}`);
    game.board[pos]='❌';
    if (checkWin(game.board,'❌')) { tttGames.delete(from); return sock.sendMessage(from,{text:`╭━━━『 🏆 *YOU WIN!* 』━━━╮\n\n${renderBoard(game.board)}\n\n🎉 @${senderNum} wins!\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[sender]},{quoted:msg}); }
    const empty=game.board.map((v,i)=>({v,i})).filter(({v})=>!['❌','⭕'].includes(v));
    if (!empty.length) { tttGames.delete(from); return sock.sendMessage(from,{text:`${renderBoard(game.board)}\n\n🤝 *Draw!*\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg}); }
    const botMove=empty[Math.floor(Math.random()*empty.length)];
    game.board[botMove.i]='⭕';
    if (checkWin(game.board,'⭕')) { tttGames.delete(from); return sock.sendMessage(from,{text:`╭━━━『 🤖 *BOT WINS!* 』━━━╮\n\n${renderBoard(game.board)}\n\n💀 Bot wins! Try again: .tictactoe start\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg}); }
    await sock.sendMessage(from,{text:`${renderBoard(game.board)}\n\n_Your turn! Type 1-9_\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['dice'],      name:'dice',      category:'Games',description:'Roll dice',usage:'.dice [sides] [vs]',cooldown:3,handler:diceHandler},
  {command:['coin'],      name:'coin',      category:'Games',description:'Flip a coin',usage:'.coin [heads/tails]',cooldown:3,handler:coinHandler},
  {command:['quiz'],      name:'quiz',      category:'Games',description:'Quiz game',usage:'.quiz',cooldown:5,handler:quizHandler},
  {command:['math'],      name:'math',      category:'Games',description:'Math challenge',usage:'.math',cooldown:5,handler:mathHandler},
  {command:['tictactoe'], name:'tictactoe', category:'Games',description:'Play Tic Tac Toe',usage:'.tictactoe start',cooldown:3,handler:tttHandler},
];
