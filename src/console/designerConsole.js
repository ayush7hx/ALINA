const figlet = require("figlet");
const chalk = require("chalk");

let boxen;
try {
  boxen = require("boxen");
} catch (e) {
  boxen = null; // optional dependency - fallback if not installed
}

const colors = {
  CYAN: chalk.cyan,
  PURPLE: chalk.magenta,
  PINK: chalk.hex('#d685d6'),
  BLUE: chalk.blue,
  GREEN: chalk.green,
  YELLOW: chalk.keyword('yellow'),
  RED: chalk.red,
  WHITE: chalk.white,
  GRAY: chalk.gray,
  BOLD: chalk.bold,
  DIM: chalk.dim
};

function separator(width = 60) {
  const pieces = ['─', '─', '─'];
  return pieces.join('')?.repeat(Math.max(1, Math.floor(width / 3)));
}

function formatUptime() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function clearConsole() {
  // Clear console based on platform
  console.clear();
  process.stdout.write('\x1Bc'); // Alternative clear for better compatibility
}

function printTitanAscii() {
  const titanArt = `
 █████  ██      ██ ███    ██  █████  
██   ██ ██      ██ ████   ██ ██   ██ 
███████ ██      ██ ██ ██  ██ ███████ 
██   ██ ██      ██ ██  ██ ██ ██   ██ 
██   ██ ███████ ██ ██   ████ ██   ██ 
`;

  console.log(colors.CYAN(titanArt));
  console.log(colors.DIM(colors.WHITE('═'.repeat(process.stdout.columns || 80))));
  console.log('');
}

function showDesignerConsole(client) {
  try {
    // Clear console first
    clearConsole();

    // Print TITAN ASCII at the top
    printTitanAscii();

    const cols = process.stdout.columns || 80;
    const guildCount = client.guilds?.cache?.size ?? 'N/A';
    const shardCount = client.shard?.count ?? 1;
    const nodeCount = (typeof client.getAvailableNodes === 'function') ? (client.getAvailableNodes()?.length || 0) : (client.manager?.nodes?.length || 0);

    const lines = [];

    // Bot header with enhanced styling
    lines.push(colors.BOLD(colors.PURPLE(`╔═══════════════════════════════════════════════════════════╗`)));
    lines.push(colors.BOLD(colors.PURPLE(`║`) + colors.CYAN(`          ♪ ${client.user?.username || 'Bot'} Music System ♪          `) + colors.PURPLE(`║`)));
    lines.push(colors.BOLD(colors.PURPLE(`╚═══════════════════════════════════════════════════════════╝`)));
    lines.push('');

    // Status indicator
    lines.push(colors.GREEN('  ●') + colors.BOLD(colors.WHITE(' ONLINE')) + colors.DIM(colors.GRAY(' • All Systems Operational')));
    lines.push('');

    // Bot information section
    lines.push(colors.BOLD(colors.CYAN('  📊 System Information')));
    lines.push(colors.DIM(colors.WHITE('  ─────────────────────────────────────────────────────')));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Bot Tag:      ') + colors.CYAN(`${client.user?.tag || client.user?.id || 'N/A'}`));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Servers:      ') + colors.GREEN(`${guildCount} guilds`));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Shards:       ') + colors.PURPLE(`${shardCount} active`));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Lavalink:     ') + colors.PINK(`${nodeCount} nodes`));
    lines.push('');

    // Technical details
    lines.push(colors.BOLD(colors.CYAN('  ⚙️  Environment')));
    lines.push(colors.DIM(colors.WHITE('  ─────────────────────────────────────────────────────')));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Runtime:      ') + colors.BLUE(`${process.version}`));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Platform:     ') + colors.BLUE(`${process.platform} (${process.arch})`));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Memory Usage: ') + colors.YELLOW(`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`));
    lines.push(colors.WHITE('  └─ ') + colors.GRAY('Uptime:       ') + colors.GREEN(`${formatUptime()}`));
    lines.push('');

    // Features badge
    lines.push(colors.DIM(colors.WHITE('  ─────────────────────────────────────────────────────')));
    lines.push(colors.WHITE('  ') + colors.BOLD(colors.GREEN('✓')) + colors.GRAY(' High-Quality Audio  ') +
      colors.BOLD(colors.GREEN('✓')) + colors.GRAY(' Low Latency  ') +
      colors.BOLD(colors.GREEN('✓')) + colors.GRAY(' 24/7 Reliable'));
    lines.push('');

    // Timestamp
    lines.push(colors.DIM(colors.GRAY(`  Ready at: ${new Date().toLocaleString()}`)));
    lines.push('');

    let output = lines.join('\n');

    if (boxen) {
      output = boxen(output, {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 2, right: 2 },
        borderStyle: 'double',
        borderColor: 'cyan',
        backgroundColor: '#000000'
      });
      console.log(output);
    } else {
      output.split('\n').forEach(l => console.log(l));
    }

    // Footer separator
    console.log(colors.DIM(colors.CYAN('═'.repeat(cols))));
    console.log('');

  } catch (err) {
    console.error(chalk.red('[DESIGNER] Failed to render console:'), err);
  }
}

// Helper: print small event lines in designer style
function eventLine(label, msg, colorFn = colors.WHITE) {
  try {
    const time = new Date().toLocaleTimeString();
    const line = `  ${colorFn(`[${label}]`)} ${colors.DIM(`${time}`)} ${colors.WHITE('│')} ${msg}`;
    if (boxen) {
      console.log(boxen(line, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: 0,
        borderStyle: 'round',
        borderColor: 'gray',
        dimBorder: true
      }));
    } else {
      console.log(line);
    }
  } catch (e) {
    console.log(`[${label}] ${msg}`);
  }
}

// Attach event helpers to the exported function so other modules can call them
showDesignerConsole.nodeConnect = (node) => {
  eventLine('LAVALINK', `${colors.GREEN('✓')} ${node.name} ${colors.GREEN('connected')}`, colors.CYAN);
};

showDesignerConsole.nodeReady = (node) => {
  eventLine('LAVALINK', `${colors.PURPLE('●')} ${node.name} ${colors.PURPLE('ready')}`, colors.CYAN);
};

showDesignerConsole.nodeDisconnect = (node) => {
  eventLine('LAVALINK', `${colors.YELLOW('⚠')} ${node.name} ${colors.YELLOW('disconnected')}`, colors.CYAN);
};

showDesignerConsole.nodeError = (node, error) => {
  eventLine('ERROR', `${colors.RED('✗')} ${node.name}: ${colors.RED(error?.message || error)}`, colors.RED);
};

showDesignerConsole.playerCreate = (player) => {
  eventLine('PLAYER', `${colors.GREEN('+')} Created for guild ${colors.CYAN(player.guildId)}`, colors.GREEN);
};

showDesignerConsole.playerDestroy = (player) => {
  eventLine('PLAYER', `${colors.YELLOW('-')} Destroyed for guild ${colors.CYAN(player.guildId)}`, colors.YELLOW);
};

showDesignerConsole.info = (msg) => {
  eventLine('INFO', `${colors.BLUE('ℹ')} ${msg}`, colors.BLUE);
};

showDesignerConsole.success = (msg) => {
  eventLine('SUCCESS', `${colors.GREEN('✓')} ${msg}`, colors.GREEN);
};

showDesignerConsole.error = (msg) => {
  eventLine('ERROR', `${colors.RED('✗')} ${msg}`, colors.RED);
};

// Print a prominent boxed block for a stage (title + array of lines or single string)
showDesignerConsole.showBlock = (title, content, borderColor = 'cyan') => {
  try {
    const body = Array.isArray(content) ? content.join('\n') : String(content);
    const header = colors.BOLD(colors.CYAN(` 📦 ${title} `));
    const text = `${header}\n${colors.DIM(colors.WHITE('─'.repeat(50)))}\n${body}`;
    if (boxen) {
      console.log(boxen(text, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor,
        dimBorder: false
      }));
    } else {
      const cols = process.stdout.columns || 80;
      const sep = separator(Math.min(cols, 60));
      console.log(colors.CYAN(sep));
      text.split('\n').forEach((l) => console.log(l));
      console.log(colors.CYAN(sep));
    }
  } catch (e) {
    console.log(`[${title}] ${content}`);
  }
};

// Show a compact stage block with a status icon (success/warn/error/pending)
showDesignerConsole.showStage = (title, status = 'info', details = [], options = {}) => {
  try {
    const iconMap = {
      success: '✓',
      error: '✗',
      warn: '⚠',
      info: 'ℹ',
      pending: '⟳',
    };
    const colorMap = {
      success: colors.GREEN,
      error: colors.RED,
      warn: colors.YELLOW,
      info: colors.CYAN,
      pending: colors.BLUE,
    };

    const colorFn = colorMap[status] || colorMap.info;
    const icon = iconMap[status] || iconMap.info;

    const time = new Date().toLocaleTimeString();
    const header = `${colorFn.bold(`${icon} ${title}`)} ${colors.DIM(`• ${time}`)}\n`;

    const body = Array.isArray(details) ? details.map(d => `  ${d}`).join('\n') : String(details || '');
    const text = `${header}\n${body}`.trim();

    if (boxen) {
      console.log(boxen(text, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: options.borderColor || 'cyan',
        dimBorder: true
      }));
    } else {
      const cols = process.stdout.columns || 80;
      const sep = separator(Math.min(cols, 60));
      console.log(colorFn(sep));
      text.split('\n').forEach((l) => console.log(l));
      console.log(colorFn(sep));
    }
  } catch (e) {
    console.log(`[${title}] ${details}`);
  }
};

module.exports = showDesignerConsole;