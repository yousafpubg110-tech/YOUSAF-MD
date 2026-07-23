/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   YOUSAF-BALOCH-MD — PLUGIN LOADER PATCH                        ║
 * ║   This patch file provides enhanced plugin loading functionality ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load all plugins from the plugins directory
 * @param {string} pluginsDir - Path to plugins directory
 * @returns {Map} - Map of loaded plugins
 */
export async function loadPlugins(pluginsDir = __dirname) {
  const plugins = new Map();
  
  if (!existsSync(pluginsDir)) {
    console.log(chalk.yellow('[PLUGINS] Creating plugins directory...'));
    mkdirSync(pluginsDir, { recursive: true });
    return plugins;
  }

  let files;
  try {
    // Skip self (loader.js) to avoid loading loops
    files = readdirSync(pluginsDir).filter(f => f.endsWith('.js') && f !== 'loader.js');
  } catch (err) {
    console.error(chalk.red('[PLUGINS] Failed to read plugins directory:'), err.message);
    return plugins;
  }

  if (!files.length) {
    console.log(chalk.yellow('[PLUGINS] No plugin files found.'));
    return plugins;
  }

  let loaded = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const filePath = join(pluginsDir, file);
      const mod = await import(`file://${filePath}?v=${Date.now()}`);
      
      // Support all export variations: default, named, or objects
      const handler = mod.default || mod.commands || mod.plugins || mod;

      if (!handler) {
        console.warn(chalk.yellow(`[PLUGINS] ${file}: No valid export found`));
        failed++;
        continue;
      }

      // Support ARRAY exports: export default [ {...}, {...} ]
      if (Array.isArray(handler)) {
        let regCount = 0;
        for (const item of handler) {
          if (!item) continue;
          const cmdKeys = item.command || item.name || item.cmd || item.alias;
          const execFunc = item.handler || item.execute || item.run || item.operate;
          
          if (!cmdKeys || typeof execFunc !== 'function') continue;

          const cmds = Array.isArray(cmdKeys) ? cmdKeys : [cmdKeys];
          for (const name of cmds) {
            if (typeof name === 'string' && name.trim()) {
              plugins.set(name.toLowerCase().trim(), {
                ...item,
                command: name.toLowerCase().trim(),
                handler: execFunc,
              });
            }
          }
          regCount++;
        }
        if (regCount > 0) {
          console.log(chalk.green(`[PLUGINS] ✅ ${file}: ${regCount} commands loaded`));
          loaded++;
        } else {
          console.warn(chalk.yellow(`[PLUGINS] ⚠️ ${file}: No executable commands found`));
          failed++;
        }
        continue;
      }

      // Support SINGLE export or OBJECT with MULTIPLE exports
      let commandNames = [];
      
      if (handler.command instanceof RegExp) {
        commandNames = handler.command.source
          .replace('^(', '').replace(')$', '')
          .replace('^', '').replace('$', '')
          .split('|').map(c => c.trim().toLowerCase());
      } else if (Array.isArray(handler.command)) {
        commandNames = handler.command.map(c => String(c).toLowerCase());
      } else if (typeof handler.command === 'string') {
        commandNames = [handler.command.toLowerCase()];
      } else if (handler.name && typeof handler.name === 'string') {
        commandNames = [handler.name.toLowerCase()];
      }

      // Check for named functions inside the module if no standard command structure
      if (!commandNames.length && typeof mod === 'object') {
        for (const [key, val] of Object.entries(mod)) {
          if (val && (val.command || val.name) && (val.handler || val.execute || val.run)) {
            const nameKey = val.command || val.name;
            const exec = val.handler || val.execute || val.run;
            const names = Array.isArray(nameKey) ? nameKey : [nameKey];
            for (const n of names) {
              if (typeof n === 'string') {
                plugins.set(n.toLowerCase().trim(), { ...val, handler: exec });
                commandNames.push(n.toLowerCase().trim());
              }
            }
          }
        }
      }

      if (!commandNames.length) {
        console.warn(chalk.yellow(`[PLUGINS] ⚠️ ${file}: No command names matched`));
        failed++;
        continue;
      }

      const activeFunc = handler.handler || handler.execute || handler.run || handler.operate;
      for (const name of commandNames) {
        plugins.set(name, {
          ...handler,
          command: name,
          handler: activeFunc,
        });
      }
      
      console.log(chalk.green(`[PLUGINS] ✅ ${file}: ${commandNames.length} commands loaded`));
      loaded++;
      
    } catch (err) {
      console.error(chalk.red(`[PLUGINS] ❌ ${file}:`), err.message);
      failed++;
    }
  }

  console.log(chalk.cyan(`[PLUGINS] 📊 Summary: ${loaded} files loaded, ${failed} failed. Total: ${plugins.size} commands`));
  
  return plugins;
}

/**
 * Reload a specific plugin
 * @param {string} filePath - Path to plugin file
 * @returns {object|null} - Loaded plugin or null
 */
export async function reloadPlugin(filePath) {
  try {
    const mod = await import(`file://${filePath}?t=${Date.now()}`);
    return mod.default || mod;
  } catch (err) {
    console.error(chalk.red(`[PLUGINS] Failed to reload ${filePath}:`), err.message);
    return null;
  }
}

/**
 * Get plugin info
 * @param {Map} plugins - Plugins map
 * @param {string} command - Command name
 * @returns {object|null} - Plugin info
 */
export function getPluginInfo(plugins, command) {
  if (!plugins || !command) return null;
  return plugins.get(command.toLowerCase().trim()) || null;
}

/**
 * List all loaded plugins
 * @param {Map} plugins - Plugins map
 * @returns {Array} - Array of plugin info
 */
export function listPlugins(plugins) {
  if (!plugins || !(plugins instanceof Map)) return [];
  const list = [];
  const seen = new Set();
  
  for (const [name, plugin] of plugins) {
    if (seen.has(plugin)) continue;
    seen.add(plugin);
    
    list.push({
      name: plugin.name || name,
      category: plugin.category || 'General',
      description: plugin.description || 'No description provided',
      usage: plugin.usage || `.${name}`,
      commands: Array.isArray(plugin.command) ? plugin.command : [plugin.command || name],
    });
  }
  
  return list.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
}

export default {
  loadPlugins,
  reloadPlugin,
  getPluginInfo,
  listPlugins,
};

