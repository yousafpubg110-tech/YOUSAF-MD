/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  islamic_v2      ┃
┃  Commands: prayertime hijri asma       ┃
┃            names tafsir               ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { SYSTEM } from '../config.js';

// ─── prayertime (auto + manual) ───────────────────────────────────────────────
async function prayertimeHandler({msg,args}) {
  try {
    const city=args?.length?args.join(' '):'Karachi';
    await msg.react('🕌'); await msg.reply(`⏳ *Getting prayer times for ${city}…*`);
    const res=await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1`,{timeout:15000});
    const t=res.data?.data?.timings; if (!t) { await msg.react('❌'); return msg.reply(`❌ Not found for ${city}!\n${SYSTEM.SHORT_WATERMARK}`); }
    const date=res.data?.data?.date?.readable||'Today';
    await msg.reply(`╭━━━『 🕌 *PRAYER TIMES* 』━━━╮\n\n📍 *City:* ${city}\n📅 *Date:* ${date}\n\n╭─『 🕰️ *Awqat-e-Namaz* 』\n│ 🌅 *Fajr:*    ${t.Fajr}\n│ ☀️ *Sunrise:* ${t.Sunrise}\n│ 🌞 *Dhuhr:*   ${t.Dhuhr}\n│ 🌤️ *Asr:*     ${t.Asr}\n│ 🌆 *Maghrib:* ${t.Maghrib}\n│ 🌙 *Isha:*    ${t.Isha}\n│ 🌃 *Midnight:*${t.Midnight}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _اللہ ہماری نمازیں قبول فرمائے_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[PRAYERTIME]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── hijri ────────────────────────────────────────────────────────────────────
async function hijriHandler({msg}) {
  try {
    await msg.react('🌙');
    const res=await axios.get(`https://api.aladhan.com/v1/gToH?date=${new Date().toLocaleDateString('en-GB')}`,{timeout:10000});
    const h=res.data?.data?.hijri; if (!h) { await msg.react('❌'); return msg.reply(`❌ Failed to get Hijri date!\n${SYSTEM.SHORT_WATERMARK}`); }
    const g=res.data?.data?.gregorian;
    await msg.reply(`╭━━━『 🌙 *HIJRI CALENDAR* 』━━━╮\n\n📅 *Gregorian:* ${g?.date}\n🌙 *Hijri:* ${h?.date}\n\n╭─『 📖 *Details* 』\n│ 📅 *Hijri Day:* ${h?.day}\n│ 🗓️ *Hijri Month:* ${h?.month?.en} (${h?.month?.ar})\n│ 🔢 *Hijri Year:* ${h?.year} AH\n│ 📆 *Week Day:* ${h?.weekday?.en}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[HIJRI]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── asma ul husna ────────────────────────────────────────────────────────────
const ALLAH_NAMES=[
  {num:1,arabic:'الرَّحْمَنُ',tr:'Ar-Rahman',urdu:'بہت مہربان',fazilat:'100 بار پڑھنے سے دل میں رحمت اور نرمی پیدا ہوتی ہے'},
  {num:2,arabic:'الرَّحِيمُ',tr:'Ar-Raheem',urdu:'بار بار رحم کرنے والا',fazilat:'100 بار پڑھنے سے اللہ کی رحمت نازل ہوتی ہے'},
  {num:3,arabic:'الْمَلِكُ',tr:'Al-Malik',urdu:'بادشاہ',fazilat:'صبح کثرت سے پڑھنے سے دنیا میں عزت ملتی ہے'},
  {num:4,arabic:'الْقُدُّوسُ',tr:'Al-Quddus',urdu:'پاک اور منزہ',fazilat:'100 بار پڑھنے سے دل کی پاکیزگی حاصل ہوتی ہے'},
  {num:5,arabic:'السَّلاَمُ',tr:'As-Salam',urdu:'سلامتی دینے والا',fazilat:'160 بار پڑھ کر دم کرنے سے بیماری دور ہوتی ہے'},
  {num:6,arabic:'الْمُؤْمِنُ',tr:'Al-Mumin',urdu:'امن دینے والا',fazilat:'630 بار پڑھنے سے ظالموں سے حفاظت ہوتی ہے'},
  {num:7,arabic:'الْعَزِيزُ',tr:'Al-Aziz',urdu:'غالب اور عزت والا',fazilat:'40 بار پڑھنے سے بے نیازی نصیب ہوتی ہے'},
  {num:8,arabic:'اللَّطِيفُ',tr:'Al-Lateef',urdu:'باریک بین اور مہربان',fazilat:'رزق اور روزی کے لیے کثرت سے پڑھیں'},
  {num:9,arabic:'الْغَفُورُ',tr:'Al-Ghafoor',urdu:'بہت بخشنے والا',fazilat:'توبہ کے وقت پڑھنے سے گناہ معاف ہوتے ہیں'},
  {num:10,arabic:'الشَّكُورُ',tr:'Ash-Shakoor',urdu:'قدردان',fazilat:'نعمتوں میں اضافہ ہوتا ہے'},
];
async function asmaHandler({msg,args}) {
  try {
    await msg.react('☪️');
    let name;
    if (args?.length) {
      const num=parseInt(args[0]); if (!isNaN(num)&&num>=1&&num<=99) name=ALLAH_NAMES.find(n=>n.num===num)||ALLAH_NAMES[Math.floor(Math.random()*ALLAH_NAMES.length)];
      else name=ALLAH_NAMES.find(n=>n.tr.toLowerCase().includes(args[0].toLowerCase()))||ALLAH_NAMES[Math.floor(Math.random()*ALLAH_NAMES.length)];
    } else name=ALLAH_NAMES[Math.floor(Math.random()*ALLAH_NAMES.length)];
    await msg.reply(`╭━━━『 ☪️ *ASMA UL HUSNA* 』━━━╮\n\n🔢 *Name #${name.num} of 99*\n\n╭─『 📖 *Details* 』\n│ 🕌 *Arabic:* ${name.arabic}\n│ 🔤 *Transliteration:* ${name.tr}\n│ 🇵🇰 *Urdu:* ${name.urdu}\n╰──────────────────────────\n\n╭─『 ✨ *Fazilat* 』\n│ ${name.fazilat}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _اللہ کی یاد میں دل کو سکون ملتا ہے_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[ASMA]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── islamic names ────────────────────────────────────────────────────────────
const ISLAMIC_NAMES=[
  {name:'Muhammad',meaning:'Praised one',gender:'M',origin:'Arabic'},
  {name:'Fatima',meaning:'One who abstains',gender:'F',origin:'Arabic'},
  {name:'Yousaf',meaning:'God increases',gender:'M',origin:'Hebrew/Arabic'},
  {name:'Aisha',meaning:'She who lives',gender:'F',origin:'Arabic'},
  {name:'Omar',meaning:'Long-lived',gender:'M',origin:'Arabic'},
  {name:'Zainab',meaning:'Fragrant flower',gender:'F',origin:'Arabic'},
  {name:'Ibrahim',meaning:'Father of nations',gender:'M',origin:'Arabic'},
  {name:'Maryam',meaning:'Pure/Beloved',gender:'F',origin:'Arabic'},
  {name:'Abdullah',meaning:'Servant of Allah',gender:'M',origin:'Arabic'},
  {name:'Khadija',meaning:'Premature child',gender:'F',origin:'Arabic'},
  {name:'Hassan',meaning:'Handsome/Good',gender:'M',origin:'Arabic'},
  {name:'Hafsa',meaning:'Lioness',gender:'F',origin:'Arabic'},
  {name:'Bilal',meaning:'Moisture/Freshness',gender:'M',origin:'Arabic'},
  {name:'Ruqayyah',meaning:'Rising/Ascending',gender:'F',origin:'Arabic'},
  {name:'Usman',meaning:'Baby bustard',gender:'M',origin:'Arabic'},
];
async function namesHandler({msg,args}) {
  try {
    await msg.react('👶');
    const filter=args?.length?args.join(' ').toLowerCase():'';
    let filtered=filter?ISLAMIC_NAMES.filter(n=>n.name.toLowerCase().includes(filter)||n.meaning.toLowerCase().includes(filter)||(filter==='boy'&&n.gender==='M')||(filter==='girl'&&n.gender==='F')):ISLAMIC_NAMES.slice(0,5);
    if (!filtered.length) filtered=ISLAMIC_NAMES.slice(0,5);
    const shown=filtered.slice(0,8);
    const list=shown.map((n,i)=>`│ ${i+1}. *${n.name}* (${n.gender==='M'?'👦':'👧'})\n│    Meaning: ${n.meaning}`).join('\n│\n');
    await msg.reply(`╭━━━『 👶 *ISLAMIC NAMES* 』━━━╮\n\n${filter?`🔍 *Search:* ${filter}\n`:''}📋 *Results:* ${shown.length}\n\n╭─『 Names 』\n${list}\n╰──────────────────────────\n\n💡 .names boy / .names girl / .names Muhammad\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[NAMES]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── tafsir ───────────────────────────────────────────────────────────────────
async function tafsirHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide surah:ayah!\n\n.tafsir 2:255 — Ayat-ul-Kursi\n.tafsir 1:1 — Al-Fatiha\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('📖');
    const [surahStr,ayahStr]=(args[0]||'2:255').split(':'); const surah=parseInt(surahStr)||2; const ayah=parseInt(ayahStr||'255')||255;
    if (surah<1||surah>114) return msg.reply(`❌ Invalid Surah! (1-114)\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.reply(`⏳ *Getting Tafsir for Surah ${surah}:${ayah}…*`);
    // Get Arabic + English + Urdu
    const [arabicRes,urduRes]=await Promise.allSettled([
      axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.sahih`,{timeout:15000}),
      axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ur.jalandhry`,{timeout:15000}),
    ]);
    const arabic=arabicRes.status==='fulfilled'?arabicRes.value.data?.data?.[0]:null;
    const english=arabicRes.status==='fulfilled'?arabicRes.value.data?.data?.[1]:null;
    const urdu=urduRes.status==='fulfilled'?urduRes.value.data?.data:null;
    if (!arabic) { await msg.react('❌'); return msg.reply(`❌ Ayah not found!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 📖 *TAFSIR* 』━━━╮\n\n📌 *${arabic.surah?.englishName}* (${arabic.surah?.name}) — Ayah ${ayah}\n\n🕌 *Arabic:*\n${arabic.text}\n\n🇬🇧 *Translation (English):*\n${english?.text||'N/A'}\n\n🇵🇰 *ترجمہ (اردو):*\n${urdu?.text||'N/A'}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _اللہ ہمیں قرآن سمجھنے کی توفیق دے_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[TAFSIR]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

export default [
  {command:['prayertime'],name:'prayertime',category:'Islamic',description:'Namaz times for any city',usage:'.prayertime [city]',cooldown:5,handler:prayertimeHandler},
  {command:['hijri'],     name:'hijri',    category:'Islamic',description:'Current Hijri date',usage:'.hijri',cooldown:5,handler:hijriHandler},
  {command:['asma'],      name:'asma',     category:'Islamic',description:'99 Names of Allah',usage:'.asma [number/name]',cooldown:5,handler:asmaHandler},
  {command:['names'],     name:'names',    category:'Islamic',description:'Islamic baby names',usage:'.names [boy/girl/search]',cooldown:5,handler:namesHandler},
  {command:['tafsir'],    name:'tafsir',   category:'Islamic',description:'Quran tafsir (translation)',usage:'.tafsir 2:255',cooldown:5,handler:tafsirHandler},
];
