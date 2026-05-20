<div align="center">

# 🎵 Lunexa Music Bot

### High-Quality • Fast • Reliable Discord Music Bot

[![Discord](https://img.shields.io/badge/Discord-Support-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/KyzAgk2GUr)
[![Hosting](https://img.shields.io/badge/Hosting-VexaNode-5865F2?style=for-the-badge)](https://discord.vexanode.cloud)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)

*Lunexa is a modern, powerful Discord music bot designed for smooth playback, high performance, and full automation. Built to handle large Discord servers with stability, speed, and crystal-clear audio quality.*

[Invite Bot](https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&integration_type=0&scope=bot) • [Support Server](https://discord.gg/KyzAgk2GUr) • [Hosting](https://discord.vexanode.cloud)

</div>

---

## ✨ Features

### 🎶 Music Playback
- **High-Quality Audio Streaming** - Crystal clear sound with Lavalink
- **Multi-Platform Support** - YouTube, Spotify, SoundCloud, and more
- **Advanced Queue Management** - Add, remove, shuffle, and organize tracks
- **Loop Modes** - Track loop, queue loop, or no loop
- **Autoplay** - Automatically plays similar songs when queue ends
- **24/7 Playback** - Stable, uninterrupted music streaming

### 🎨 User Experience
- **Beautiful Player Cards** - Custom-designed now playing cards with Canvas
- **Interactive Controls** - Button-based music controls (play, pause, skip, etc.)
- **Real-time Progress Bar** - Live updating progress display
- **Setup Channel** - Dedicated music request channel with persistent controls
- **Lyrics Support** - Display lyrics for currently playing songs

### ⚙️ Advanced Features
- **Discord.js v14** - Latest Discord API features
- **Hybrid Sharding** - Scalable for large bot deployments
- **MongoDB Database** - Persistent guild settings and user data
- **DJ Role System** - Permission-based music controls
- **Premium System** - Optional premium features
- **Auto-Reconnect** - Automatic recovery from disconnections
- **Error Handling** - Robust error recovery and logging

### 🎮 Commands
- **Music**: `play`, `pause`, `resume`, `skip`, `stop`, `queue`, `nowplaying`, `volume`, `shuffle`, `loop`, `autoplay`, `lyrics`
- **Filters**: `bassboost`, `nightcore`, `vaporwave`, `tremolo`, `vibrato`, `karaoke`, `distortion`
- **Playlist**: Create and manage custom playlists
- **Info**: `stats`, `help`, `ping`, `profile`
- **Config**: `setup`, `prefix`, `dj`, and more

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20.0.0 or higher ([Download](https://nodejs.org))
- **MongoDB** Database ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) recommended)
- **Lavalink Server** ([Setup Guide](https://github.com/freyacodes/Lavalink))
- **Discord Bot Token** ([Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/titanxdevz/Lunexa.git
   cd Lunexa
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Discord Bot Configuration
   TOKEN=your_discord_bot_token_here
   
   # MongoDB Configuration
   MONGO_URI=your_mongodb_connection_string_here
   
   # Spotify API (Optional - for Spotify support)
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   
   # Top.gg API (Optional - for bot statistics)
   TOPGG_API_KEY=your_topgg_api_key
   ```

4. **Configure Bot Settings**
   
   Edit `src/config/config.js`:
   ```javascript
   module.exports = {
     token: process.env.TOKEN,
     Mongo: process.env.MONGO_URI,
     
     // Lavalink Nodes
     nodes: [
       {
         name: "Node 1",
         host: "lavalink.jirayu.net",
         port: 13592,
         password: "youshallnotpass",
         secure: false
       }
     ],
     
     // Spotify Configuration
     spotiId: process.env.SPOTIFY_CLIENT_ID,
     spotiSecret: process.env.SPOTIFY_CLIENT_SECRET,
     
     // Bot Settings
     color: "#5865F2",
     invite: "https://discord.gg/KyzAgk2GUr",
     
     // Top.gg
     topgg_Api: process.env.TOPGG_API_KEY,
     
     // Webhook URLs (Optional)
     error_log: "your_error_webhook_url"
   };
   ```

5. **Start the Bot**
   ```bash
   npm start
   ```

---

## 🖥️ Hosting

### Recommended Hosting: VexaNode

**VexaNode** provides premium Discord bot hosting with:
- ✅ 24/7 Uptime
- ✅ High Performance Servers
- ✅ DDoS Protection
- ✅ Easy Management Panel
- ✅ Affordable Pricing
- ✅ Expert Support

**Get Started:** [https://discord.vexanode.cloud](https://discord.vexanode.cloud)

### Self-Hosting Options

#### Option 1: PM2 (Recommended for VPS)
```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start src/Lunexa.js --name "Lunexa"

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

#### Option 2: Docker
```bash
# Build Docker image
docker build -t lunexa-bot .

# Run container
docker run -d --name lunexa --env-file .env lunexa-bot
```

#### Option 3: Screen (Linux)
```bash
# Create a new screen session
screen -S lunexa

# Start the bot
npm start

# Detach from screen: Ctrl+A then D
# Reattach: screen -r lunexa
```

---

## 🔧 Configuration

### Lavalink Setup

1. **Download Lavalink**
   ```bash
   wget https://github.com/freyacodes/Lavalink/releases/latest/download/Lavalink.jar
   ```

2. **Create `application.yml`**
   ```yaml
   server:
     port: 2333
     address: 0.0.0.0
   
   lavalink:
     server:
       password: "youshallnotpass"
       sources:
         youtube: true
         bandcamp: true
         soundcloud: true
         twitch: true
         vimeo: true
         http: true
         local: false
   ```

3. **Start Lavalink**
   ```bash
   java -jar Lavalink.jar
   ```

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud - Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Get connection string and add to `.env`

**Option 2: Local MongoDB**
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb

# Connection string
MONGO_URI=mongodb://localhost:27017/lunexa
```

---

## 📝 Commands

### Music Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `play` | Play a song or playlist | `!play <song name/url>` |
| `pause` | Pause the current track | `!pause` |
| `resume` | Resume playback | `!resume` |
| `skip` | Skip to next track | `!skip` |
| `stop` | Stop playback and clear queue | `!stop` |
| `queue` | Show current queue | `!queue` |
| `nowplaying` | Show current track | `!nowplaying` |
| `volume` | Set volume (0-150) | `!volume <number>` |
| `shuffle` | Shuffle the queue | `!shuffle` |
| `loop` | Toggle loop mode | `!loop <track/queue/off>` |
| `autoplay` | Toggle autoplay | `!autoplay` |
| `lyrics` | Show song lyrics | `!lyrics` |

### Filter Commands
| Command | Description |
|---------|-------------|
| `bassboost` | Apply bass boost filter |
| `nightcore` | Apply nightcore filter |
| `vaporwave` | Apply vaporwave filter |
| `tremolo` | Apply tremolo filter |
| `vibrato` | Apply vibrato filter |
| `karaoke` | Apply karaoke filter |
| `distortion` | Apply distortion filter |

### Configuration Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `setup` | Setup music request channel | `!setup` |
| `prefix` | Change bot prefix | `!prefix <new prefix>` |
| `dj` | Set DJ role | `!dj <role>` |

---

## 🛠️ Troubleshooting

### Common Issues

**Bot not responding to commands**
- Check if bot has proper permissions in the server
- Verify the prefix is correct (`!` by default)
- Ensure bot is online and connected

**Music not playing**
- Verify Lavalink server is running
- Check Lavalink connection in `config.js`
- Ensure bot has permission to join and speak in voice channels

**Database errors**
- Verify MongoDB connection string in `.env`
- Check MongoDB server is running
- Ensure database user has proper permissions

**Lavalink connection failed**
- Verify Lavalink host, port, and password
- Check firewall settings
- Ensure Lavalink server is running

---

## 🤝 Contributing

Contributions are always welcome! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Private use

---

## 👥 Credits & Acknowledgments

### Development Team

**Original Developer**
- [next-2-beat](https://github.com/next-2-beat/) - Original Creator & Lead Developer

**Modified & Enhanced By**
- **Titan X Dev** - Enhanced Features & Modifications
- Support Server: [https://discord.gg/KyzAgk2GUr](https://discord.gg/KyzAgk2GUr)

### Hosting Partner

**VexaNode Hosting**
- Premium Discord Bot Hosting
- Website: [https://discord.vexanode.cloud](https://discord.vexanode.cloud)
- 24/7 Support & High Performance Servers

### Special Thanks

- **Discord.js** - Discord API wrapper
- **Lavalink** - Audio streaming server
- **Riffy** - Lavalink client wrapper
- **MongoDB** - Database solution
- All contributors and supporters

---

## 📞 Support

Need help? Join our support server!

[![Discord Banner](https://api.weblutions.com/discord/invite/KyzAgk2GUr/)](https://discord.gg/KyzAgk2GUr)

**Support Server:** [https://discord.gg/KyzAgk2GUr](https://discord.gg/KyzAgk2GUr)

**Hosting Support:** [https://discord.vexanode.cloud](https://discord.vexanode.cloud)

---

## 📊 Statistics

- **Servers:** Growing daily
- **Uptime:** 99.9%
- **Commands:** 80+
- **Music Sources:** YouTube, Spotify, SoundCloud, and more

---

## 🔮 Roadmap

- [ ] Slash commands support
- [ ] Web dashboard
- [ ] Advanced playlist management
- [ ] Music recommendations
- [ ] Multi-language support
- [ ] Custom equalizer presets
- [ ] Voice channel activity integration

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Made with ❤️ by Titan X Dev & next-2-beat**

**Powered by VexaNode Hosting**

[⬆ Back to Top](#-lunexa-music-bot)

</div>
