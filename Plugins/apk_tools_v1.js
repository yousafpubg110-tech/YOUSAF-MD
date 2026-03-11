/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  apk_tools_v1    ┃
┃  Commands: apk modapk playstore        ┃
┃            apkmod apkdl                ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios  from 'axios';
import { load as cheerioLoad } from 'cheerio';
import { OWNER, SYSTEM } from '../config.js';

const DL_FOOTER = `\n📢 *Channel:* ${OWNER.CHANNEL}`;
const safeUrl = u => { try { const p=new URL(u); return ['https:','http:'].includes(p.protocol)?p.href:null; } catch { return null; } };

async function searchApkMody(query) {
  const url=safeUrl(`https://apkmody.io/?s=${encodeURIComponent(query)}`); if (!url) throw new Error('bad query');
  const res=await axios.get(url,{timeout:15000,headers:{'User-Agent':'Mozilla/5.0'}});
  const $=cheerioLoad(res.data); const apps=[];
  $('.post').slice(0,3).each((_,el)=>{ const t=$(el).find('.entry-title a').text().trim(); const u=$(el).find('.entry-title a').attr('href'); const v=$(el).find('.version').text().trim(); if (t&&u) apps.push({title:t,url:u,version:v}); });
  return apps;
}

async function searchApkPure(query) {
  const url=safeUrl(`https://apkpure.com/search?q=${encodeURIComponent(query)}`); if (!url) throw new Error('bad query');
  const res=await axios.get(url,{timeout:15000,headers:{'User-Agent':'Mozilla/5.0'}});
  const $=cheerioLoad(res.data); const apps=[];
  $('.search-result-item').slice(0,3).each((_,el)=>{ const t=$(el).find('p.intro-title').text().trim(); const h=$(el).find('a').attr('href'); const u=h?(h.startsWith('http')?h:`https://apkpure.com${h}`):null; const v=$(el).find('.ver-info-top span').first().text().trim(); if (t&&u) apps.push({title:t,url:u,version:v}); });
  return apps;
}

async function apkHandler({sock,msg,from,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide an app name!\n\n.apk WhatsApp\n.apk Spotify${DL_FOOTER}`);
    await msg.react('📱'); const query=args.join(' '); await msg.reply(`⏳ *Searching APK for: ${query}…*`);
    let apps=[]; try { apps=await searchApkMody(query); } catch (_) {}
    if (!apps.length) { try { apps=await searchApkPure(query); } catch (_) {} }
    if (!apps.length) { await msg.react('❌'); return msg.reply(`❌ No APK found for _${query}_!${DL_FOOTER}`); }
    let msg2=`╭━━━『 📱 *APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a,i)=>{ msg2+=`\n${i+1}. *${a.title}*\n   📦 Version: ${a.version||'Latest'}\n   🔗 ${a.url}\n`; });
    msg2+=`\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n💡 Copy the link to download${DL_FOOTER}`;
    await msg.reply(msg2); await msg.react('✅');
  } catch (e) { console.error('[APK]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function modApkHandler({sock,msg,from,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide an app name!\n\n.modapk CapCut Pro\n.modapk Spotify Premium${DL_FOOTER}`);
    await msg.react('💎'); const query=args.join(' '); await msg.reply(`⏳ *Searching Mod APK for: ${query}…*`);
    let apps=[]; try { apps=await searchApkMody(query+' mod premium'); } catch (_) {}
    if (!apps.length) { try { apps=await searchApkMody(query+' modded'); } catch (_) {} }
    if (!apps.length) { await msg.react('❌'); return msg.reply(`❌ No Mod APK found!${DL_FOOTER}`); }
    let msg2=`╭━━━『 💎 *MOD APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a,i)=>{ msg2+=`\n${i+1}. *${a.title}*\n   📦 Version: ${a.version||'Latest'}\n   🔗 ${a.url}\n`; });
    msg2+=`\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⚠️ _Mod APKs are for educational purposes only_${DL_FOOTER}`;
    await msg.reply(msg2); await msg.react('✅');
  } catch (e) { console.error('[MODAPK]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function playstoreHandler({sock,msg,from,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide an app name!\n\n.playstore WhatsApp\n.playstore YouTube${DL_FOOTER}`);
    await msg.react('🛒'); const query=args.join(' '); await msg.reply(`⏳ *Searching Play Store for: ${query}…*`);
    const url=safeUrl(`https://apkpure.com/search?q=${encodeURIComponent(query)}`); if (!url) { await msg.react('❌'); return msg.reply('❌ Invalid query.'); }
    const res=await axios.get(url,{timeout:15000,headers:{'User-Agent':'Mozilla/5.0'}});
    const $=cheerioLoad(res.data); const apps=[];
    $('.search-result-item').slice(0,5).each((_,el)=>{ const t=$(el).find('p.intro-title').text().trim(); const h=$(el).find('a').attr('href'); const u=h?(h.startsWith('http')?h:`https://apkpure.com${h}`):null; const rating=$(el).find('.rating').text().trim(); const v=$(el).find('.ver-info-top span').first().text().trim(); if (t&&u) apps.push({title:t,url:u,rating,version:v}); });
    if (!apps.length) { await msg.react('❌'); return msg.reply(`❌ No apps found for _${query}_!${DL_FOOTER}`); }
    let msg2=`╭━━━『 🛒 *PLAY STORE SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a,i)=>{ msg2+=`\n${i+1}. *${a.title}*\n   ⭐ Rating: ${a.rating||'N/A'}\n   📦 Version: ${a.version||'Latest'}\n   🔗 ${a.url}\n`; });
    msg2+=`\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯${DL_FOOTER}`;
    await msg.reply(msg2); await msg.react('✅');
  } catch (e) { console.error('[PLAYSTORE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['apk'],      name:'apk',      category:'Downloader',description:'Search APK files',usage:'.apk <app name>',cooldown:10,handler:apkHandler},
  {command:['modapk'],   name:'modapk',   category:'Downloader',description:'Search Mod APKs',usage:'.modapk <app name>',cooldown:10,handler:modApkHandler},
  {command:['playstore'],name:'playstore',category:'Downloader',description:'Search Play Store apps',usage:'.playstore <app name>',cooldown:10,handler:playstoreHandler},
  {command:['apkmod'],   name:'apkmod',   category:'Downloader',description:'Mod APK alias',usage:'.apkmod <app name>',cooldown:10,handler:modApkHandler},
  {command:['apkdl'],    name:'apkdl',    category:'Downloader',description:'APK download alias',usage:'.apkdl <app name>',cooldown:10,handler:apkHandler},
];
