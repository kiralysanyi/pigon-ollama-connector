# Chatbot thing for pigon

## Requirements

- Ollama
- Pigon
- An account on pigon
- Thats it

## Setup

### .env

Note: the username is already provided to the chatbot so you don't have to include it in the system prompt.

```
SERVER="https://pigon.ddns.net"
USRNAME=""
PASSWORD=""
DEVICENAME="kecske"
DATA_ROOT="/data"
MODEL="gemma3:4b"
SYSPROMPT="You are a friendly chatbot"
OLLAMA_HOST="http://localhost:11434"
```

## Docker

I have included stuff to set up with docker, but you can do the old school way with npm install start and systemd config hell.