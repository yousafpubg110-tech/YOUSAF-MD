/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  islamic_v1      ┃
┃  Commands: quran ayat hadith dua       ┃
┃            prayer                      ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { SYSTEM } from '../config.js';

const BISMILLAH = '﷽';

// ─── quran ────────────────────────────────────────────────────────────────────
async function quranHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide surah and ayah!\n\n*Format:*\n.quran 1:1 — Surah Al-Fatiha, Ayah 1\n.quran 2:255 — Ayat-ul-Kursi\n.quran 112:1 — Al-Ikhlas\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('📖');
    const input=args[0]; const [surahStr,ayahStr]=input.split(':'); const surah=parseInt(surahStr); const ayah=parseInt(ayahStr||'1');
    if (isNaN(surah)||surah<1||surah>114) return msg.reply(`❌ Invalid Surah! Must be 1-114\n${SYSTEM.SHORT_WATERMARK}`);
    const res=await axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah||1}/editions/quran-uthmani,en.sahih,ur.jalandhry`,{timeout:15000});
    const [arabic,english,urdu]=res.data?.data||[];
    if (!arabic) { await msg.react('❌'); return msg.reply(`❌ Ayah not found!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 📖 *HOLY QURAN* 』━━━╮\n\n${BISMILLAH}\n\n📌 *Surah ${arabic.surah?.englishName} (${arabic.surah?.name})* — Ayah ${ayah||1}\n\n🕌 *Arabic:*\n${arabic.text}\n\n🇬🇧 *English:*\n${english?.text||'N/A'}\n\n🇵🇰 *Urdu:*\n${urdu?.text||'N/A'}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _May Allah accept our recitation_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[QURAN]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── ayat (random) ────────────────────────────────────────────────────────────
async function ayatHandler({msg}) {
  try {
    await msg.react('🕌');
    const surah=Math.floor(Math.random()*114)+1; const ayah=Math.floor(Math.random()*7)+1;
    const res=await axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.sahih`,{timeout:15000});
    const [arabic,english]=res.data?.data||[];
    if (!arabic) { await msg.react('❌'); return msg.reply(`❌ Failed to get ayah!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 🕌 *DAILY AYAH* 』━━━╮\n\n${BISMILLAH}\n\n📌 *${arabic.surah?.englishName} (${arabic.surah?.name})* — ${ayah}\n\n🕌 *Arabic:*\n${arabic.text}\n\n🇬🇧 *English:*\n${english?.text||'N/A'}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _SubhanAllah_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[AYAT]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── hadith ───────────────────────────────────────────────────────────────────
const HADITHS = [
  {text:"Actions are judged by their intentions.",narrator:"Prophet Muhammad ﷺ",source:"Bukhari & Muslim"},
  {text:"The best of people are those who are most beneficial to others.",narrator:"Prophet Muhammad ﷺ",source:"Tabarani"},
  {text:"Seek knowledge from the cradle to the grave.",narrator:"Prophet Muhammad ﷺ",source:"Ibn Abdul-Barr"},
  {text:"Cleanliness is half of faith.",narrator:"Prophet Muhammad ﷺ",source:"Muslim"},
  {text:"The strong person is not one who can wrestle, but one who controls himself during anger.",narrator:"Prophet Muhammad ﷺ",source:"Bukhari"},
  {text:"None of you believes until he loves for his brother what he loves for himself.",narrator:"Prophet Muhammad ﷺ",source:"Bukhari & Muslim"},
  {text:"Speak good or remain silent.",narrator:"Prophet Muhammad ﷺ",source:"Bukhari & Muslim"},
  {text:"The best richness is the richness of the soul.",narrator:"Prophet Muhammad ﷺ",source:"Bukhari"},
];
async function hadithHandler({msg}) {
  try {
    await msg.react('📜');
    const h=HADITHS[Math.floor(Math.random()*HADITHS.length)];
    await msg.reply(`╭━━━『 📜 *HADITH SHARIF* 』━━━╮\n\n☪️ *Hadith:*\n"${h.text}"\n\n👑 *Narrator:* ${h.narrator}\n📚 *Source:* ${h.source}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _May Allah guide us_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[HADITH]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── dua ──────────────────────────────────────────────────────────────────────
const DUAS = [
  {name:'For everything','arabic':'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الٱلْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',transliteration:'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina azab-annar',meaning:'Our Lord give us good in this world and hereafter, and save us from hellfire.'},
  {name:'For forgiveness',arabic:'رَبِّ اغْفِرْلِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ',transliteration:'Rabbighfirli wa tub alaiya innaka anta at-tawwabu ar-raheem',meaning:'My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful.'},
  {name:'For anxiety',arabic:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',transliteration:'Hasbunallahu wa nimal-wakeel',meaning:'Allah is sufficient for us, and He is the best disposer of affairs.'},
  {name:'Morning Dua',arabic:'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا',transliteration:'Allahumma bika asbahna wa bika amsayna',meaning:'O Allah, by Your grace we have reached the morning and by Your grace we reach the evening.'},
];
async function duaHandler({msg,args}) {
  try {
    await msg.react('🤲');
    const dua=args?.length?DUAS.find(d=>d.name.toLowerCase().includes(args.join(' ').toLowerCase()))||DUAS[Math.floor(Math.random()*DUAS.length)]:DUAS[Math.floor(Math.random()*DUAS.length)];
    await msg.reply(`╭━━━『 🤲 *DUA SHARIF* 』━━━╮\n\n📌 *Dua for:* ${dua.name}\n\n🕌 *Arabic:*\n${dua.arabic}\n\n🔤 *Transliteration:*\n${dua.transliteration}\n\n🌍 *Meaning:*\n${dua.meaning}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _Ameen_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[DUA]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── prayer times ─────────────────────────────────────────────────────────────
async function prayerHandler({msg,args}) {
  try {
    const city=args?.length?args.join(' '):'Karachi';
    await msg.react('🕌'); await msg.reply(`⏳ *Getting prayer times for ${city}…*`);
    const res=await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1`,{timeout:15000});
    const t=res.data?.data?.timings; if (!t) { await msg.react('❌'); return msg.reply(`❌ Prayer times not found for ${city}!\n${SYSTEM.SHORT_WATERMARK}`); }
    const date=res.data?.data?.date?.readable||new Date().toDateString();
    await msg.reply(`╭━━━『 🕌 *PRAYER TIMES* 』━━━╮\n\n📍 *City:* ${city}\n📅 *Date:* ${date}\n\n╭─『 🕰️ *Timings* 』\n│ 🌅 *Fajr:*    ${t.Fajr}\n│ ☀️ *Sunrise:* ${t.Sunrise}\n│ 🌞 *Dhuhr:*   ${t.Dhuhr}\n│ 🌤️ *Asr:*     ${t.Asr}\n│ 🌆 *Maghrib:* ${t.Maghrib}\n│ 🌙 *Isha:*    ${t.Isha}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _May Allah accept our prayers_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[PRAYER]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

export default [
  {command:['quran'], name:'quran', category:'Islamic',description:'Get Quran ayah',usage:'.quran 2:255',cooldown:5,handler:quranHandler},
  {command:['ayat'],  name:'ayat',  category:'Islamic',description:'Random Quranic ayah',usage:'.ayat',cooldown:5,handler:ayatHandler},
  {command:['hadith'],name:'hadith',category:'Islamic',description:'Random hadith',usage:'.hadith',cooldown:5,handler:hadithHandler},
  {command:['dua'],   name:'dua',   category:'Islamic',description:'Islamic dua',usage:'.dua [topic]',cooldown:5,handler:duaHandler},
  {command:['prayer'],name:'prayer',category:'Islamic',description:'Prayer times for any city',usage:'.prayer [city]',cooldown:5,handler:prayerHandler},
];
