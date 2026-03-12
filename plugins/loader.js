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
export async function loadPlugins(pluginsDir) {
  const plugins = new Map();
  
  if (!existsSync(pluginsDir)) {
    console.log(chalk.yellow('[PLUGINS] Creating plugins directory...'));
    mkdirSync(pluginsDir, { recursive: true });
    return plugins;
  }

  let files;
  try {
    files = readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
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
      const mod = await import(`file://${join(pluginsDir, file)}`);
      const handler = mod.default;

      if (!handler) {
        console.warn(chalk.yellow(`[PLUGINS] ${file}: No default export`));
        failed++;
        continue;
      }

      // Support ARRAY exports: export default [ {...}, {...} ]
      if (Array.isArray(handler)) {
        let regCount = 0;
        for (const item of handler) {
          if (!item || !item.command || !(item.handler || item.execute)) continue;
          
          const cmds = Array.isArray(item.command) ? item.command : [item.command];
          for (const name of cmds) {
            plugins.set(name.toLowerCase(), {
              ...item,
              handler: item.handler || item.execute,
            });
          }
          regCount++;
        }
        if (regCount > 0) {
          console.log(chalk.green(`[PLUGINS] ✅ ${file}: ${regCount} commands`));
          loaded++;
        } else {
          console.warn(chalk.yellow(`[PLUGINS] ⚠️ ${file}: No valid commands`));
          failed++;
        }
        continue;
      }

      // Support SINGLE export: export default { command, handler }
      let commandNames = [];
      if (handler.command instanceof RegExp) {
        commandNames = handler.command.source
          .replace('^(', '').replace(')$', '')
          .split('|').map(c => c.trim().toLowerCase());
      } else if (Array.isArray(handler.command)) {
        commandNames = handler.command.map(c => c.toLowerCase());
      } else if (typeof handler.command === 'string') {
        commandNames = [handler.command.toLowerCase()];
      }

      if (!commandNames.length) {
        console.warn(chalk.yellow(`[PLUGINS] ⚠️ ${file}: No command names found`));
        failed++;
        continue;
      }

      for (const name of commandNames) {
        plugins.set(name, {
          ...handler,
          handler: handler.handler || handler.execute || handler.run,
        });
      }
      
      console.log(chalk.green(`[PLUGINS] ✅ ${file}: ${commandNames.length} commands`));
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
    return mod.default || null;
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
  return plugins.get(command?.toLowerCase()) || null;
}

/**
 * List all loaded plugins
 * @param {Map} plugins - Plugins map
 * @returns {Array} - Array of plugin info
 */
export function listPlugins(plugins) {
  const list = [];
  const seen = new Set();
  
  for (const [name, plugin] of plugins) {
    if (seen.has(plugin)) continue;
    seen.add(plugin);
    
    list.push({
      name: plugin.name || name,
      category: plugin.category || 'Uncategorized',
      description: plugin.description || 'No description',
      usage: plugin.usage || `.${name}`,
      commands: Array.isArray(plugin.command) ? plugin.command : [plugin.command || name],
    });
  }
  
  return list.sort((a, b) => a.category.localeCompare(b.category));
}

export default {
  loadPlugins,
  reloadPlugin,
  getPluginInfo,
  listPlugins,
};
    
