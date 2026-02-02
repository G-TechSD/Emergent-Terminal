# Emergent Terminal

A standalone terminal server with **shared sessions** for multi-device access. Multiple clients connect to the same terminal and see output in real-time - like tmux, but in your browser.

## Features

- **🔄 Shared Sessions** - Multiple clients see the same terminal in real-time
- **🔐 Token Authentication** - Secure access with auto-generated tokens
- **🔒 HTTPS Support** - Auto-detects SSL certificates
- **📜 Output Replay** - New clients catch up with buffered output
- **🌐 Browser-based** - Full xterm.js terminal experience
- **💾 Persistent** - Server survives client disconnects
- **🖥️ Pop-out Support** - Open terminal in dedicated window

## Quick Start

```bash
# Install
npm install -g emergent-terminal

# Run (starts on port 3100)
emergent-terminal

# Or with npx
npx emergent-terminal
```

Open https://localhost:3100 and enter the token shown in the console.

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `EMERGENT_PORT` | `3100` | Server port |
| `EMERGENT_USE_TMUX` | `false` | Enable tmux for session persistence |
| `EMERGENT_TMUX_SESSION` | `emergent` | Tmux session name |

## HTTPS

For HTTPS, place these files in your working directory:
- `localhost.key` - SSL private key
- `localhost.crt` - SSL certificate

Generate self-signed certs:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key -out localhost.crt \
  -subj "/CN=localhost"
```

## Token Management

```bash
# Regenerate access token
emergent-terminal --regenerate-token
```

Token is stored in `.local-storage/emergent-token.json`

## Use Cases

- **Remote Development** - Access your terminal from any device
- **Pair Programming** - Share your terminal with teammates in real-time
- **Persistent Sessions** - Terminal survives browser refreshes
- **Mobile Access** - Check on long-running commands from your phone
- **Teaching/Demos** - Students see exactly what you type

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Browser 1  │────▶│             │◀────│  Browser 2  │
│  (laptop)   │     │  Emergent   │     │  (phone)    │
└─────────────┘     │  Terminal   │     └─────────────┘
                    │   Server    │
┌─────────────┐     │             │     ┌─────────────┐
│  Browser 3  │────▶│   [PTY]     │◀────│  Browser 4  │
│  (tablet)   │     │             │     │  (desktop)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

All clients share a single PTY (pseudo-terminal). Input from any client is sent to the terminal, and output is broadcast to all clients simultaneously.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Terminal interface (requires auth) |
| `/login` | GET/POST | Authentication page |
| `/logout` | GET | Clear session |
| `/api/health` | GET | Server health check |
| `/api/token` | GET | Get current token (localhost only) |
| `/ws` | WebSocket | Terminal connection |

## Development

```bash
# Clone
git clone https://github.com/G-TechSD/emergent-terminal
cd emergent-terminal

# Install deps
npm install

# Run in dev mode
npm run dev

# Build
npm run build
```

## Why "Emergent"?

The terminal session "emerges" from wherever you need it - laptop, phone, tablet. It's always there, always the same session, always in sync.

## License

MIT

---

Built by [G-Tech SD](https://gtechsd.com)
