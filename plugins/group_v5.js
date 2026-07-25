/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  group_v5        ┃
┃  Commands: settings mute unmute        ┃
┃            leave invite                ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';

// NOTE: this used to be registered as '.settings open|close', which collided
// with auto_v1.js's '.settings' (bot feature status dump) — whichever file
// loaded last silently won. Renamed to dedicated '.groupopen'/'.groupclose'
// commands, matching what config.js's ADMIN_COMMANDS list and the bot menu
// already expected.
async function groupModeHandler(action, {sock,msg,from,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can change group settings!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to change settings!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳');
    if (action==='open') { await sock.groupSettingUpdate(from,'not_announcement'); await msg.reply(`✅ Group is now *OPEN!*\n\nAll members can send messages.\n${SYSTEM.SHORT_WATERMARK}`); await msg.react('✅'); }
    else { await sock.groupSettingUpdate(from,'announcement'); await msg.reply(`✅ Group is now *CLOSED!*\n\nOnly admins can send messages.\n${SYSTEM.SHORT_WATERMARK}`); await msg.react('✅'); }
  } catch (e) { console.error('[GROUPMODE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}
async function groupOpenHandler(ctx)  { return groupModeHandler('open', ctx); }
async function groupCloseHandler(ctx) { return groupModeHandler('close', ctx); }

async function muteHandler({sock,msg,from,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can mute the group!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to mute!\n${SYSTEM.SHORT_WATERMARK}`);
    await sock.groupSettingUpdate(from,'announcement');
    await msg.reply(`🔇 *Group Muted!*\n\nOnly admins can now send messages.\n${SYSTEM.SHORT_WATERMARK}`); await msg.react('🔇');
  } catch (e) { console.error('[MUTE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function unmuteHandler({sock,msg,from,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can unmute the group!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to unmute!\n${SYSTEM.SHORT_WATERMARK}`);
    await sock.groupSettingUpdate(from,'not_announcement');
    await msg.reply(`🔊 *Group Unmuted!*\n\nAll members can now send messages.\n${SYSTEM.SHORT_WATERMARK}`); await msg.react('🔊');
  } catch (e) { console.error('[UNMUTE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function leaveGroupHandler({sock,msg,from,sender,isOwner}) {
  try {
    const senderNum=sender?.split('@')[0]||'';
    if (!isOwner&&senderNum!==OWNER.NUMBER) return msg.reply(`❌ Only Bot Owner can use this command!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('👋');
    const meta=await sock.groupMetadata(from);
    await sock.sendMessage(from,{text:`╭━━━『 👋 *BOT LEAVING* 』━━━╮\n\n💔 *الوداع ${meta.subject}!*\n\n🤖 Bot اس گروپ کو چھوڑ رہا ہے۔\n👑 *By:* ${OWNER.FULL_NAME}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await new Promise(r=>setTimeout(r,2000)); await sock.groupLeave(from);
  } catch (e) { console.error('[LEAVE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function inviteHandler({sock,msg,from,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can get the invite link!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to get invite link!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🔗');
    const code=await sock.groupInviteCode(from); const link=`https://chat.whatsapp.com/${code}`;
    const meta=await sock.groupMetadata(from);
    await msg.reply(`╭━━━『 📨 *GROUP INVITE* 』━━━╮\n\n📱 *Group:* ${meta.subject}\n👥 *Members:* ${meta.participants.length}\n\n📨 *Invite Link:*\n${link}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[INVITE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['groupopen'], name:'groupopen', category:'Group',description:'Open group — all members can send',usage:'.groupopen',groupOnly:true,cooldown:5,handler:groupOpenHandler},
  {command:['groupclose'],name:'groupclose',category:'Group',description:'Close group — admins only can send',usage:'.groupclose',groupOnly:true,cooldown:5,handler:groupCloseHandler},
  {command:['mute'],   name:'mute',   category:'Group',description:'Mute group',usage:'.mute',groupOnly:true,cooldown:5,handler:muteHandler},
  {command:['unmute'], name:'unmute', category:'Group',description:'Unmute group',usage:'.unmute',groupOnly:true,cooldown:5,handler:unmuteHandler},
  {command:['leave'],  name:'leave',  category:'Group',description:'Bot leaves group (owner only)',usage:'.leave',groupOnly:true,cooldown:5,handler:leaveGroupHandler},
  {command:['invite'], name:'invite', category:'Group',description:'Get invite link',usage:'.invite',groupOnly:true,cooldown:5,handler:inviteHandler},
];
