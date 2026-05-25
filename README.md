# BlackCoreAI

**Premium Black-Hat AI Assistant** — a lightweight, mobile-friendly AI chatbot powered by [Puter.js](https://js.puter.com/v2/).

BlackCoreAI is a fully static frontend web app. No backend, no database, no API keys, no Node.js required. Just open `index.html` in any modern browser and it works.

---

## Features

- AI chat using `puter.ai.chat()`
- Dynamic model loading via `puter.ai.listModels()` with a safe fallback list
- 10 chat modes: Normal, Code Assistant, Web Research Style, Creative Writer, Tagalog Assistant, Explain Like Beginner, Business Helper, Prompt Engineer, Social Media Helper, Cyber Study Mode
- Code Assistant toggle (works on top of any mode)
- Multiple AI providers in the fallback list: OpenAI, Anthropic, Google, xAI, DeepSeek, Meta, Mistral, Qwen, NVIDIA
- Dark mode and light mode (saved locally)
- Adjustable font size (Small / Medium / Large)
- Regenerate last response
- Copy individual AI response, copy whole chat, export chat as `.txt`
- Optional streaming response (off by default)
- Auto-resizing textarea, character counter, mobile-optimized input
- Friendly error handling — never exposes scary errors
- Code block support with safe HTML escaping (no markdown library)

## Privacy

- Chat history is stored in memory only and is cleared when the page closes.
- Only your **theme**, **font size**, **selected model**, **selected mode**, and **streaming preference** are saved in `localStorage`.
- Messages are sent to Puter.js to access AI models. Do not share private or sensitive information.

## Files

```
BlackCoreAi/
├── index.html      # Main page, loads Puter.js CDN
├── style.css       # Dark green hacker theme + light mode
├── script.js       # Vanilla JS chat logic & Puter.js integration
└── README.md       # This file
```

No build step. No npm install. No bundler. Pure HTML, CSS, and vanilla JavaScript.

## Run Locally

You can simply open `index.html` directly in any modern browser, or serve the folder with any static server. Examples:

```bash
# Python 3
python3 -m http.server 8080

# Node (if you have it)
npx serve .
```

Then visit `http://localhost:8080`.

## Deploy on Render (Static Site)

BlackCoreAI is designed to deploy on [Render](https://render.com) as a Static Site with **zero configuration**.

1. Push this repository to GitHub (or use the existing one).
2. In Render, click **New +** → **Static Site**.
3. Connect your GitHub repo and select the branch.
4. Use these settings:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `.` (a single dot, meaning the repo root)
5. Click **Create Static Site**.

Render will deploy the static files and give you a public URL. Open it on your phone — it works.

> If your `index.html` is inside a subfolder (for example, this folder is `BlackCoreAi/`), set **Publish Directory** to `BlackCoreAi` instead of `.`.

## Deploy on other static hosts

This app also works out of the box on:

- **GitHub Pages** — just enable Pages on the repo
- **Netlify** — drag-and-drop the folder
- **Cloudflare Pages** — connect the repo, no build settings
- **Vercel** — import the repo, framework preset = "Other"

No build step is needed on any of these.

## Models

The app first tries to load models from `puter.ai.listModels()`. If that returns nothing or fails, it falls back to a curated list including:

- **OpenAI:** GPT-5 Nano / Mini / Chat, GPT-4.1 Nano / Mini, GPT-4o Mini
- **Anthropic:** Claude Sonnet 4.5 / Opus 4.5 / 4.6, Claude 3.5 Sonnet
- **Google:** Gemini 3 Pro, Gemini 2.5 Pro / Flash, Gemini 2.0 Flash
- **xAI:** Grok 4 / 3
- **DeepSeek:** Chat, Reasoner
- **Meta:** Llama 3.1 8B Turbo, Llama 3.3 70B
- **Mistral:** Mistral Large, Codestral
- **Qwen:** Qwen 3.7 Max, 3.6 Plus, 3.5 Plus, Coder, QwQ 32B
- **NVIDIA:** Nemotron Ultra

> Model availability depends on Puter.js support and your account access. If a model fails, the app automatically tries `gpt-5-nano`, then `gpt-4.1-nano`, and finally asks you to choose another. You can also click **Refresh Models** to reload the list.

## Donate

If BlackCoreAI helped you and you want to support development, you can donate any amount via **GCash**:

```
09482887486
```

There is a Copy button inside the Settings panel under "Support BlackCoreAI".

## Disclaimer

- Cyber Study Mode is for **ethical** cybersecurity learning only. It will refuse illegal hacking, fraud, phishing, malware, credential theft, carding, or bypass instructions.
- Web Research Style cannot perform real-time web searches in this static frontend. It can only do what the selected AI model supports natively.
- BlackCoreAI does not claim unlimited access. Model availability is determined by Puter.js.

## Credits

Powered by [Puter.js](https://docs.puter.com/) — `https://js.puter.com/v2/`
