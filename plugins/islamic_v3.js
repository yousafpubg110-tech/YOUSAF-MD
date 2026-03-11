/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  islamic_v3      ┃
┃   Commands: zakat hajj (2 remainder)   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { SYSTEM } from '../config.js';

// ─── zakat calculator ────────────────────────────────────────────────────────
async function zakatHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide your total savings!\n\n*Format:*\n.zakat 100000\n.zakat 500000\n\n_Nisab = 87.48g gold or 612.36g silver_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('💰');
    const amount=parseFloat(args[0].replace(/[^0-9.]/g,''));
    if (isNaN(amount)||amount<=0) return msg.reply(`❌ Please provide a valid amount!\n\n.zakat 100000\n${SYSTEM.SHORT_WATERMARK}`);
    // Nisab values (approximate PKR)
    const goldNisabPKR=87.48*15000; // ~87.48g of gold at ~15000 PKR/g
    const silverNisabPKR=612.36*200; // ~612.36g of silver at ~200 PKR/g
    const nisab=Math.min(goldNisabPKR,silverNisabPKR);
    if (amount<nisab) {
      return msg.reply(`╭━━━『 💰 *ZAKAT CALCULATOR* 』━━━╮\n\n💵 *Your Savings:* PKR ${amount.toLocaleString()}\n📊 *Nisab Level:* PKR ${Math.round(nisab).toLocaleString()}\n\n✅ *Result:*\nآپ پر زکاۃ فرض نہیں ہے\n_(آپ کی رقم نصاب سے کم ہے)_\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    }
    const zakatAmount=amount*0.025;
    await msg.reply(`╭━━━『 💰 *ZAKAT CALCULATOR* 』━━━╮\n\n💵 *Total Savings:* PKR ${amount.toLocaleString()}\n📊 *Nisab Level:* PKR ${Math.round(nisab).toLocaleString()}\n\n╭─『 💸 *Zakat Details* 』\n│ ✅ آپ پر زکاۃ فرض ہے!\n│ 📈 *Rate:* 2.5%\n│ 💰 *Zakat Amount:* PKR ${zakatAmount.toLocaleString()}\n│ 📅 *Pay Annually*\n╰──────────────────────────\n\n🕌 _زکاۃ ادا کریں اور مال کو پاک کریں_\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[ZAKAT]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── hajj guide ───────────────────────────────────────────────────────────────
const HAJJ_STEPS=[
  {step:1,name:'Ihram',desc:'Wear Ihram (two white unstitched sheets for men). Make intention (Niyyah) for Hajj and recite Talbiyah: لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ'},
  {step:2,name:'Arrival in Makkah',desc:'Upon arriving, perform Tawaf al-Qudum (7 rounds around Kaaba counterclockwise starting from Hajr-e-Aswad).'},
  {step:3,name:'Sa\'i',desc:'Perform Sa\'i — walk 7 times between Safa and Marwa mountains. This commemorates Hajar\'s search for water.'},
  {step:4,name:'8th Dhul Hijjah',desc:'Travel to Mina on 8 Dhul Hijjah. Spend the day and night there performing prayers.'},
  {step:5,name:'Arafat (9th DH)',desc:'MOST IMPORTANT: Stand at Arafat from Dhuhr to sunset on 9 Dhul Hijjah. Make abundant dua and dhikr.'},
  {step:6,name:'Muzdalifah',desc:'After sunset, move to Muzdalifah. Pray Maghrib and Isha combined. Sleep and collect 49-70 pebbles.'},
  {step:7,name:'Rami (Stoning)',desc:'Return to Mina, stone the Jamarat (three pillars) starting with the largest. Recite Bismillah Allahu Akbar with each pebble.'},
  {step:8,name:'Qurbani & Halq',desc:'Perform Qurbani (animal sacrifice), then shave/trim hair (Halq/Taqsir). Now partially exit Ihram.'},
  {step:9,name:'Tawaf Ifada',desc:'Return to Makkah for Tawaf al-Ifada (7 rounds). This is a pillar of Hajj — cannot be omitted.'},
  {step:10,name:'Tashreeq Days',desc:'Return to Mina for 11th-12th Dhul Hijjah. Stone Jamarat on each day.'},
];
async function hajjHandler({msg,args}) {
  try {
    await msg.react('🕌');
    const stepNum=args?.length?parseInt(args[0]):0;
    if (stepNum>=1&&stepNum<=10) {
      const s=HAJJ_STEPS[stepNum-1];
      return msg.reply(`╭━━━『 🕌 *HAJJ GUIDE* 』━━━╮\n\n📍 *Step ${s.step}: ${s.name}*\n\n📖 *Description:*\n${s.desc}\n\n💡 Next step: .hajj ${stepNum+1<=10?stepNum+1:'Hajj complete!'}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _اللہ ہماری عبادت قبول فرمائے_\n${SYSTEM.SHORT_WATERMARK}`);
    }
    const overview=HAJJ_STEPS.map(s=>`│ *${s.step}.* ${s.name}`).join('\n');
    await msg.reply(`╭━━━『 🕌 *HAJJ GUIDE* 』━━━╮\n\n🕌 *Hajj Steps Overview*\n\n${overview}\n\n💡 Type *.hajj 1* to get details for Step 1\n💡 *.hajj 5* for Arafat (most important)\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n☪️ _لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ_\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[HAJJ]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

export default [
  {command:['zakat'],name:'zakat',category:'Islamic',description:'Zakat calculator',usage:'.zakat <amount>',cooldown:5,handler:zakatHandler},
  {command:['hajj'], name:'hajj', category:'Islamic',description:'Hajj step-by-step guide',usage:'.hajj [step 1-10]',cooldown:5,handler:hajjHandler},
];
