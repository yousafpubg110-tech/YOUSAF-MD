/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  owner_v1        ┃
┃  Commands: broadcast block unblock     ┃
┃            restart eval                ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// ─── BROADCAST Handler ────────────────────────────────────────────────────────
async function broadcastHandler({sock, msg, from, args, sender, isOwner}) {
  try {
    if (!isOwner) return msg.reply(`❌ *Only Owner can use this command!*\n${SYSTEM.SHORT_WATERMARK}`);
    
    if (!args?.length) return msg.reply(`❌ *Please provide a message!*\n\n.broadcast Hello everyone!\n.bc Important announcement\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('📢');
    const message = args.join(' ');
    
    // Get all chats
    const chats = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(chats);
    
    await msg.reply(`⏳ *Broadcasting to ${groupIds.length} groups...*\n${SYSTEM.SHORT_WATERMARK}`);
    
    let sent = 0;
    for (const groupId of groupIds) {
      try {
        await sock.sendMessage(groupId, {
          text: `╭━━━『 📢 *BROADCAST* 』━━━╮\n\n${message}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n👑 *By:* ${OWNER.FULL_NAME}\n${SYSTEM.SHORT_WATERMARK}`,
        });
        sent++;
        await new Promise(r => setTimeout(r, 1000)); // Delay to avoid rate limit
      } catch (_) {}
    }
    
    await msg.reply(`✅ *Broadcast sent!*\n\n📊 *Total Groups:* ${groupIds.length}\n✅ *Sent:* ${sent}\n❌ *Failed:* ${groupIds.length - sent}\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[BROADCAST ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Broadcast failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── BLOCK Handler ────────────────────────────────────────────────────────────
async function blockHandler({sock, msg, from, args, isOwner}) {
  try {
    if (!isOwner) return msg.reply(`❌ *Only Owner can use this command!*\n${SYSTEM.SHORT_WATERMARK}`);
    
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!target && !args?.length) {
      return msg.reply(`❌ *Please mention a user or provide a number!*\n\n.block @user\n.block 923001234567\n${SYSTEM.SHORT_WATERMARK}`);
    }
    
    await msg.react('🚫');
    
    let userToBlock = target;
    if (!userToBlock && args?.length) {
      const num = args[0].replace(/[^0-9]/g, '');
      userToBlock = num + '@s.whatsapp.net';
    }
    
    await sock.updateBlockStatus(userToBlock, 'block');
    
    await msg.reply(`🚫 *User blocked!*\n\n👤 *Number:* +${userToBlock.split('@')[0]}\n👑 *By:* ${OWNER.FULL_NAME}\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[BLOCK ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to block user!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── UNBLOCK Handler ──────────────────────────────────────────────────────────
async function unblockHandler({sock, msg, from, args, isOwner}) {
  try {
    if (!isOwner) return msg.reply(`❌ *Only Owner can use this command!*\n${SYSTEM.SHORT_WATERMARK}`);
    
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (!target && !args?.length) {
      return msg.reply(`❌ *Please mention a user or provide a number!*\n\n.unblock @user\n.unblock 923001234567\n${SYSTEM.SHORT_WATERMARK}`);
    }
    
    await msg.react('✅');
    
    let userToUnblock = target;
    if (!userToUnblock && args?.length) {
      const num = args[0].replace(/[^0-9]/g, '');
      userToUnblock = num + '@s.whatsapp.net';
    }
    
    await sock.updateBlockStatus(userToUnblock, 'unblock');
    
    await msg.reply(`✅ *User unblocked!*\n\n👤 *Number:* +${userToUnblock.split('@')[0]}\n👑 *By:* ${OWNER.FULL_NAME}\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[UNBLOCK ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to unblock user!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── RESTART Handler ──────────────────────────────────────────────────────────
async function restartHandler({msg, isOwner}) {
  try {
    if (!isOwner) return msg.reply(`❌ *Only Owner can use this command!*\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('🔄');
    await msg.reply(`🔄 *Restarting bot...*\n\n⏳ Please wait a moment.\n👑 *By:* ${OWNER.FULL_NAME}\n${SYSTEM.SHORT_WATERMARK}`);
    
    // Exit process to trigger restart (PM2 or other process manager will restart)
    setTimeout(() => process.exit(0), 2000);
  } catch (error) {
    console.error('[RESTART ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Restart failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── EVAL Handler ─────────────────────────────────────────────────────────────
async function evalHandler({sock, msg, from, args, isOwner}) {
  try {
    if (!isOwner) return msg.reply(`❌ *Only Owner can use this command!*\n${SYSTEM.SHORT_WATERMARK}`);
    
    if (!args?.length) return msg.reply(`❌ *Please provide JavaScript code!*\n\n.eval console.log('Hello')\n.eval 5 + 5\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('💻');
    const code = args.join(' ');
    
    let result;
    try {
      // Create a safe context with common variables
      const context = { sock, msg, from, console };
      const fn = new Function(...Object.keys(context), 'return eval(' + JSON.stringify(code) + ')');
      result = await fn(...Object.values(context));
    } catch (err) {
      result = `Error: ${err.message}`;
    }
    
    const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
    
    await msg.reply(`╭━━━『 💻 *EVAL RESULT* 』━━━╮\n\n📝 *Code:*\n\`\`\`js\n${code.substring(0, 100)}${code.length > 100 ? '...' : ''}\n\`\`\`\n\n✅ *Result:*\n\`\`\`\n${resultStr.substring(0, 500)}${resultStr.length > 500 ? '...' : ''}\n\`\`\`\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[EVAL ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Eval failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  {command:['broadcast','bc'], name:'broadcast', category:'Owner',description:'Broadcast message to all groups',usage:'.broadcast <message>',ownerOnly:true,cooldown:30,handler:broadcastHandler},
  {command:['block'],          name:'block',     category:'Owner',description:'Block a user',usage:'.block @user',ownerOnly:true,cooldown:5,handler:blockHandler},
  {command:['unblock'],        name:'unblock',   category:'Owner',description:'Unblock a user',usage:'.unblock @user',ownerOnly:true,cooldown:5,handler:unblockHandler},
  {command:['restart'],        name:'restart',   category:'Owner',description:'Restart the bot',usage:'.restart',ownerOnly:true,cooldown:10,handler:restartHandler},
  {command:['eval'],           name:'eval',      category:'Owner',description:'Evaluate JavaScript code',usage:'.eval <code>',ownerOnly:true,cooldown:5,handler:evalHandler},
];
