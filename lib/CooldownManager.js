/**
 * CooldownManager — YOUSAF-MD
 * Created by: Muhammad Yousaf Baloch
 */

const cooldowns = new Map();

export function checkCooldown(sender, command, ms = 3000) {
  const key  = `${sender}:${command}`;
  const now  = Date.now();
  const last = cooldowns.get(key);

  if (last && now - last < ms) {
    const remaining = Math.ceil((ms - (now - last)) / 1000);
    return { onCooldown: true, remaining };
  }

  cooldowns.set(key, now);
  return { onCooldown: false, remaining: 0 };
}

export function resetCooldown(sender, command) {
  cooldowns.delete(`${sender}:${command}`);
}

export function clearUserCooldowns(sender) {
  for (const key of cooldowns.keys()) {
    if (key.startsWith(sender + ':')) cooldowns.delete(key);
  }
}

export function cleanExpiredCooldowns(ms = 3000) {
  const now = Date.now();
  for (const [key, time] of cooldowns.entries()) {
    if (now - time > ms) cooldowns.delete(key);
  }
}
