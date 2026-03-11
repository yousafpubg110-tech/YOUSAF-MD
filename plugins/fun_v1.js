/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  fun_v1          ┃
┃   Commands: joke quote (2 remainder)   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { sanitizeUrl } from '../lib/utils.js';
import { SYSTEM } from '../config.js';

async function jokeHandler({msg}) {
  try {
    await msg.react('😂'); await msg.reply('😂 *Getting a joke…*');
    const safeApiUrl=sanitizeUrl('https://official-joke-api.appspot.com/random_joke');
    if (!safeApiUrl) { await msg.react('❌'); return msg.reply('❌ Failed to build API URL.'); }
    const res=await axios.get(safeApiUrl,{timeout:15000}); const json=res.data;
    if (!json?.setup||!json?.punchline) { await msg.react('❌'); return msg.reply('❌ Failed to get joke! Try again.'); }
    await msg.reply(`╭━━━『 😂 *RANDOM JOKE* 』━━━╮\n\n😄 *${json.setup}*\n\n💡 *Answer:* ||${json.punchline}||\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('😂');
  } catch (e) { console.error('[JOKE]',e.message); try { await msg.react('❌'); await msg.reply('❌ Failed to get joke! Try again.'); } catch (_) {} }
}

async function quoteHandler({msg}) {
  try {
    await msg.react('✨'); await msg.reply('✨ *Getting a quote…*');
    let content,author;
    try {
      const safeApiUrl=sanitizeUrl('https://api.quotable.io/random');
      if (safeApiUrl) { const res=await axios.get(safeApiUrl,{timeout:15000}); content=res.data?.content; author=res.data?.author; }
    } catch (_) {}
    if (!content) {
      const LOCAL_QUOTES=[
        {content:"The best of people are those that bring most benefit to the rest of mankind.",author:"Prophet Muhammad ﷺ"},
        {content:"Do not belittle any act of kindness, even if it is just meeting your brother with a smiling face.",author:"Prophet Muhammad ﷺ"},
        {content:"Pakistan zindabad! Work hard and make your country proud.",author:"Muhammad Ali Jinnah"},
        {content:"Education is the most powerful weapon which you can use to change the world.",author:"Nelson Mandela"},
        {content:"The secret of getting ahead is getting started.",author:"Mark Twain"},
        {content:"Darkness cannot drive out darkness; only light can do that.",author:"Martin Luther King Jr."},
      ];
      const q=LOCAL_QUOTES[Math.floor(Math.random()*LOCAL_QUOTES.length)];
      content=q.content; author=q.author;
    }
    await msg.reply(`╭━━━『 ✨ *DAILY QUOTE* 』━━━╮\n\n✨ _"${content}"_\n\n— *${author}*\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✨');
  } catch (e) { console.error('[QUOTE]',e.message); try { await msg.react('❌'); await msg.reply('❌ Failed to get quote!'); } catch (_) {} }
}

export default [
  {command:['joke','jokes','funfact'], name:'joke',  category:'Fun',description:'Get a random joke',usage:'.joke',cooldown:5,handler:jokeHandler},
  {command:['quote','quotes','motivate'],name:'quote',category:'Fun',description:'Motivational quote',usage:'.quote',cooldown:5,handler:quoteHandler},
];
