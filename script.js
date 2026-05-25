/* =========================================================
   BlackCoreAI - script.js
   Vanilla JS chatbot powered by Puter.js
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Constants ---------- */

  const STORAGE_KEYS = {
    theme: "bcai.theme",
    fontSize: "bcai.fontSize",
    model: "bcai.model",
    mode: "bcai.mode",
    streaming: "bcai.streaming",
    codeAssist: "bcai.codeAssist",
    saveHistory: "bcai.saveHistory",
    chatHistory: "bcai.chatHistory",
  };

  const SAFE_DEFAULT_MODEL = "gpt-5-nano";
  const SECONDARY_DEFAULT_MODEL = "gpt-4.1-nano";
  const MAX_CONTEXT_MESSAGES = 12; // recent context only
  const HISTORY_MAX_BYTES = 800000; // ~800KB cap to stay safely under localStorage quota

  /* Fallback model list. Each entry: { id, label, group } */
  const FALLBACK_MODELS = [
    // OpenAI
    { id: "gpt-5-nano", label: "GPT-5 Nano - Fast", group: "OpenAI" },
    { id: "openai/gpt-5-nano", label: "GPT-5 Nano (openai/)", group: "OpenAI" },
    { id: "openai/gpt-5-mini", label: "GPT-5 Mini - Balanced", group: "OpenAI" },
    { id: "openai/gpt-5-chat", label: "GPT-5 Chat - Smart", group: "OpenAI" },
    { id: "openai/gpt-5.3-chat", label: "GPT-5.3 Chat", group: "OpenAI" },
    { id: "openai/gpt-5.4-nano", label: "GPT-5.4 Nano - Latest/Fast", group: "OpenAI" },
    { id: "gpt-4.1-nano", label: "GPT-4.1 Nano", group: "OpenAI" },
    { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", group: "OpenAI" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini", group: "OpenAI" },

    // Anthropic
    { id: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5 - Coding", group: "Anthropic" },
    { id: "anthropic/claude-opus-4.5", label: "Claude Opus 4.5 - Advanced", group: "Anthropic" },
    { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6", group: "Anthropic" },
    { id: "claude-sonnet-4", label: "Claude Sonnet 4", group: "Anthropic" },
    { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", group: "Anthropic" },

    // Google
    { id: "google/gemini-3-pro", label: "Gemini 3 Pro - Advanced", group: "Google" },
    { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", group: "Google" },
    { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash - Fast", group: "Google" },
    { id: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash", group: "Google" },

    // xAI
    { id: "xai/grok-4", label: "Grok 4", group: "xAI" },
    { id: "xai/grok-3", label: "Grok 3", group: "xAI" },

    // DeepSeek
    { id: "deepseek/deepseek-chat", label: "DeepSeek Chat - Coding", group: "DeepSeek" },
    { id: "deepseek/deepseek-reasoner", label: "DeepSeek Reasoner", group: "DeepSeek" },
    { id: "deepseek-chat", label: "DeepSeek Chat", group: "DeepSeek" },

    // Meta / Llama
    { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", label: "Llama 3.1 8B Instruct Turbo", group: "Meta" },
    { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B Instruct", group: "Meta" },

    // Mistral
    { id: "mistral/mistral-large-latest", label: "Mistral Large - General", group: "Mistral" },
    { id: "mistral-large-latest", label: "Mistral Large (latest)", group: "Mistral" },
    { id: "mistral/codestral-latest", label: "Codestral - Code", group: "Mistral" },

    // Qwen
    { id: "qwen/qwen3.7-max", label: "Qwen 3.7 Max", group: "Qwen" },
    { id: "qwen/qwen3.6-plus", label: "Qwen 3.6 Plus", group: "Qwen" },
    { id: "qwen/qwen3.5-plus", label: "Qwen 3.5 Plus", group: "Qwen" },
    { id: "qwen/qwen3-coder", label: "Qwen Coder - Code", group: "Qwen" },
    { id: "qwen/qwq-32b", label: "Qwen QwQ 32B", group: "Qwen" },

    // NVIDIA
    { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1", label: "Nemotron Ultra - Reasoning", group: "NVIDIA" },
  ];

  /* Mode instructions */
  const MODE_INSTRUCTIONS = {
    normal:    "You are BlackCoreAI, a helpful and clear AI assistant. Give useful, direct, and easy-to-understand answers.",
    code:      "You are BlackCoreAI Coding Assistant. Help with clean, working, beginner-friendly code. Explain errors clearly and provide complete fixed code when needed. Prioritize bug-free code, mobile-friendly design, and simple explanations.",
    research:  "You are BlackCoreAI Research Assistant. Answer carefully and clearly. If real-time information is uncertain, say so. Do not invent sources. Explain what should be verified.",
    creative:  "You are BlackCoreAI Creative Writer. Create original, emotional, natural, non-generic writing. Avoid robotic phrasing. Make the output engaging and ready to use.",
    tagalog:   "You are BlackCoreAI Tagalog Assistant. Answer naturally in Tagalog or Taglish. Keep the tone friendly, clear, and useful.",
    beginner:  "You are BlackCoreAI Beginner Teacher. Explain things in very simple words with examples. Avoid unnecessary jargon.",
    business:  "You are BlackCoreAI Business Helper. Help create names, bios, captions, product descriptions, sales copy, and marketing ideas that sound trustworthy and professional.",
    prompt:    "You are BlackCoreAI Prompt Engineer. Improve prompts to be clear, detailed, structured, and ready to copy-paste. Make prompts work better for AI builders, image generators, video generators, and coding agents.",
    social:    "You are BlackCoreAI Social Media Helper. Help create viral-style hooks, captions, hashtags, bios, and short scripts for Facebook Reels, TikTok, and YouTube Shorts. Keep content natural and engaging.",
    cyber:     "You are BlackCoreAI Cyber Study Assistant. Help only with ethical cybersecurity learning, defensive security, safe testing, and security best practices. Refuse illegal hacking, fraud, phishing, malware, credential theft, carding, or bypass instructions.",
  };

  const CODE_ASSIST_EXTRA = "Additionally, act as a Code Assistant: provide clean, complete, working code examples. Explain logic briefly. When fixing code, return the full corrected version. Prefer modern, beginner-friendly, mobile-friendly patterns.";

  /* ---------- State ---------- */

  const state = {
    messages: [],            // {role: 'user'|'assistant', content: string, el?: HTMLElement}
    sending: false,
    currentModels: [],       // [{id,label,group}]
    selectedModel: SAFE_DEFAULT_MODEL,
    selectedMode: "normal",
    codeAssistOn: false,
    streaming: false,
    saveHistory: true,
  };

  /* ---------- DOM ---------- */

  const $ = (id) => document.getElementById(id);

  const els = {
    chatArea: $("chatArea"),
    welcomeMessage: $("welcomeMessage"),
    userInput: $("userInput"),
    sendBtn: $("sendBtn"),
    regenerateBtn: $("regenerateBtn"),
    charCount: $("charCount"),

    modelSelect: $("modelSelect"),
    modeSelect: $("modeSelect"),
    refreshModelsBtn: $("refreshModelsBtn"),
    codeAssistBtn: $("codeAssistBtn"),
    codeBadge: $("codeBadge"),

    settingsBtn: $("settingsBtn"),
    settingsModal: $("settingsModal"),
    closeSettingsBtn: $("closeSettingsBtn"),

    themeSelect: $("themeSelect"),
    modelSelectSettings: $("modelSelectSettings"),
    modeSelectSettings: $("modeSelectSettings"),
    fontSizeSelect: $("fontSizeSelect"),
    streamingSelect: $("streamingSelect"),
    saveHistorySelect: $("saveHistorySelect"),
    clearChatBtn: $("clearChatBtn"),
    copyChatBtn: $("copyChatBtn"),
    exportChatBtn: $("exportChatBtn"),
    refreshModelsBtnSettings: $("refreshModelsBtnSettings"),

    gcashNumber: $("gcashNumber"),
    copyGcashBtn: $("copyGcashBtn"),
    gcashCopyStatus: $("gcashCopyStatus"),

    toast: $("toast"),
  };

  /* ---------- Utilities ---------- */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Safe formatter:
   * - escape HTML
   * - detect ```lang\n...\n``` code blocks
   * - inline `code`
   * - convert line breaks to <br> outside code
   */
  function formatMessage(text) {
    if (text == null) return "";
    const safe = String(text);
    const parts = [];
    const codeFenceRe = /```([a-zA-Z0-9_+\-]*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeFenceRe.exec(safe)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: safe.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", lang: match[1] || "", content: match[2] || "" });
      lastIndex = codeFenceRe.lastIndex;
    }
    if (lastIndex < safe.length) {
      parts.push({ type: "text", content: safe.slice(lastIndex) });
    }

    return parts
      .map((p) => {
        if (p.type === "code") {
          return `<pre><code>${escapeHtml(p.content)}</code></pre>`;
        }
        // inline `code` and line breaks
        let escaped = escapeHtml(p.content);
        escaped = escaped.replace(/`([^`\n]+)`/g, (_, c) => `<code>${c}</code>`);
        escaped = escaped.replace(/\n/g, "<br>");
        return escaped;
      })
      .join("");
  }

  function showToast(message, duration = 2200) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, duration);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // fall through to fallback
    }
    // Fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      els.chatArea.scrollTop = els.chatArea.scrollHeight;
    });
  }

  /* ---------- Settings & Persistence ---------- */

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f4fff8" : "#050d08");
  }

  function applyFontSize(size) {
    document.documentElement.setAttribute("data-font", size || "medium");
  }

  function loadSettings() {
    const theme = safeGet(STORAGE_KEYS.theme) || "dark";
    const font = safeGet(STORAGE_KEYS.fontSize) || "medium";
    const model = safeGet(STORAGE_KEYS.model) || SAFE_DEFAULT_MODEL;
    const mode = safeGet(STORAGE_KEYS.mode) || "normal";
    const streaming = safeGet(STORAGE_KEYS.streaming) === "on";
    const codeAssist = safeGet(STORAGE_KEYS.codeAssist) === "on";
    const savedHistoryPref = safeGet(STORAGE_KEYS.saveHistory);
    // Default ON if user has never set the preference
    const saveHistory = savedHistoryPref === null ? true : savedHistoryPref === "on";

    applyTheme(theme);
    applyFontSize(font);

    state.selectedModel = model;
    state.selectedMode = mode;
    state.streaming = streaming;
    state.codeAssistOn = codeAssist;
    state.saveHistory = saveHistory;

    els.themeSelect.value = theme;
    els.fontSizeSelect.value = font;
    els.streamingSelect.value = streaming ? "on" : "off";
    els.saveHistorySelect.value = saveHistory ? "on" : "off";

    els.modeSelect.value = mode;
    els.modeSelectSettings.value = mode;

    updateCodeAssistButtonUI();
  }

  /* ---------- Model Loading ---------- */

  function dedupeModels(list) {
    const seen = new Set();
    const out = [];
    for (const m of list) {
      if (!m || !m.id) continue;
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(m);
    }
    return out;
  }

  function normalizeDynamicModels(raw) {
    // Try to handle common shapes from puter.ai.listModels()
    if (!raw) return [];
    let arr = [];
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (Array.isArray(raw.models)) {
      arr = raw.models;
    } else if (Array.isArray(raw.data)) {
      arr = raw.data;
    } else if (typeof raw === "object") {
      // Object map: { provider: [ids] } or similar
      try {
        const flat = [];
        for (const [provider, val] of Object.entries(raw)) {
          if (Array.isArray(val)) {
            for (const item of val) {
              if (typeof item === "string") flat.push({ id: item, group: provider });
              else if (item && item.id) flat.push({ ...item, group: item.group || provider });
            }
          }
        }
        if (flat.length) arr = flat;
      } catch (e) { /* ignore */ }
    }

    return arr
      .map((m) => {
        if (typeof m === "string") return { id: m, label: prettyLabel(m), group: guessGroup(m) };
        if (m && (m.id || m.name || m.model)) {
          const id = m.id || m.name || m.model;
          return {
            id: String(id),
            label: m.label || m.display_name || prettyLabel(String(id)),
            group: m.group || m.provider || guessGroup(String(id)),
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  function guessGroup(id) {
    const s = id.toLowerCase();
    if (s.includes("gpt") || s.startsWith("openai/") || s.includes("o1") || s.includes("o3")) return "OpenAI";
    if (s.includes("claude") || s.startsWith("anthropic/")) return "Anthropic";
    if (s.includes("gemini") || s.startsWith("google/")) return "Google";
    if (s.includes("grok") || s.startsWith("xai/")) return "xAI";
    if (s.includes("deepseek")) return "DeepSeek";
    if (s.includes("llama") || s.startsWith("meta")) return "Meta";
    if (s.includes("mistral") || s.includes("codestral")) return "Mistral";
    if (s.includes("qwen") || s.includes("qwq")) return "Qwen";
    if (s.includes("nemotron") || s.startsWith("nvidia/")) return "NVIDIA";
    return "Other";
  }

  function prettyLabel(id) {
    // Strip provider prefix and prettify
    const stripped = id.includes("/") ? id.split("/").slice(1).join("/") : id;
    return stripped
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function populateModelSelects(models) {
    state.currentModels = models;
    [els.modelSelect, els.modelSelectSettings].forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = "";

      // Group by provider
      const groups = {};
      for (const m of models) {
        const g = m.group || "Other";
        if (!groups[g]) groups[g] = [];
        groups[g].push(m);
      }
      const order = ["OpenAI", "Anthropic", "Google", "xAI", "DeepSeek", "Meta", "Mistral", "Qwen", "NVIDIA", "Other"];
      const keys = Object.keys(groups).sort((a, b) => {
        const ai = order.indexOf(a); const bi = order.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });

      for (const key of keys) {
        const og = document.createElement("optgroup");
        og.label = key;
        for (const m of groups[key]) {
          const opt = document.createElement("option");
          opt.value = m.id;
          opt.textContent = m.label || m.id;
          og.appendChild(opt);
        }
        sel.appendChild(og);
      }
    });

    // Preserve / set selected model
    const desired = state.selectedModel;
    const exists = models.some((m) => m.id === desired);
    const finalModel = exists ? desired : (models[0] ? models[0].id : SAFE_DEFAULT_MODEL);
    state.selectedModel = finalModel;
    els.modelSelect.value = finalModel;
    els.modelSelectSettings.value = finalModel;
  }

  async function loadModels({ silent = false } = {}) {
    let dynamic = [];
    try {
      if (typeof puter !== "undefined" && puter.ai && typeof puter.ai.listModels === "function") {
        const raw = await puter.ai.listModels();
        dynamic = normalizeDynamicModels(raw);
      }
    } catch (err) {
      console.warn("[BlackCoreAI] listModels failed:", err);
    }

    let combined;
    if (dynamic && dynamic.length > 0) {
      // Merge dynamic + fallback so user always has choices
      combined = dedupeModels([...dynamic, ...FALLBACK_MODELS]);
      populateModelSelects(combined);
      if (!silent) showToast("Models refreshed.");
    } else {
      combined = dedupeModels(FALLBACK_MODELS);
      populateModelSelects(combined);
      if (!silent) showToast("Could not refresh model list. Fallback models are loaded.");
    }
  }

  /* ---------- Persistent Chat History ---------- */

  function saveChatHistory() {
    if (!state.saveHistory) return;
    try {
      let data = state.messages.map((m) => ({ role: m.role, content: m.content }));
      let json = JSON.stringify(data);
      // Trim oldest pair-by-pair if storage exceeds cap
      while (json.length > HISTORY_MAX_BYTES && data.length > 2) {
        data.shift();
        json = JSON.stringify(data);
      }
      safeSet(STORAGE_KEYS.chatHistory, json);
    } catch (e) {
      console.warn("[BlackCoreAI] Could not save chat history:", e);
    }
  }

  function loadSavedChatArray() {
    try {
      const raw = safeGet(STORAGE_KEYS.chatHistory);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(
        (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
      );
    } catch (e) {
      console.warn("[BlackCoreAI] Could not parse saved chat:", e);
      return [];
    }
  }

  function clearSavedChat() {
    try { localStorage.removeItem(STORAGE_KEYS.chatHistory); } catch (e) { /* ignore */ }
  }

  function restoreSavedChat() {
    const arr = loadSavedChatArray();
    if (arr.length === 0) return 0;
    hideWelcome();
    for (const m of arr) {
      if (m.role === "user") {
        const el = renderUserMessage(m.content);
        state.messages.push({ role: "user", content: m.content, el });
      } else {
        const msg = document.createElement("div");
        msg.className = "message message-ai";
        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        msg.appendChild(bubble);
        els.chatArea.appendChild(msg);
        fillAiMessage(msg, m.content);
        state.messages.push({ role: "assistant", content: m.content, el: msg });
      }
    }
    els.regenerateBtn.disabled = !hasUserMessage();
    return arr.length;
  }

  /* ---------- Code Assist toggle ---------- */

  function updateCodeAssistButtonUI() {
    if (!els.codeAssistBtn) return;
    els.codeAssistBtn.setAttribute("aria-pressed", state.codeAssistOn ? "true" : "false");
    els.codeBadge.classList.toggle("badge-hidden", !state.codeAssistOn);
  }

  function toggleCodeAssist() {
    state.codeAssistOn = !state.codeAssistOn;
    safeSet(STORAGE_KEYS.codeAssist, state.codeAssistOn ? "on" : "off");
    updateCodeAssistButtonUI();
  }

  /* ---------- Messages / DOM Rendering ---------- */

  function hideWelcome() {
    if (els.welcomeMessage && els.welcomeMessage.parentNode) {
      els.welcomeMessage.parentNode.removeChild(els.welcomeMessage);
    }
  }

  function renderUserMessage(text) {
    hideWelcome();
    const msg = document.createElement("div");
    msg.className = "message message-user";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = formatMessage(text);
    msg.appendChild(bubble);
    els.chatArea.appendChild(msg);
    scrollChatToBottom();
    return msg;
  }

  function renderAiPlaceholder() {
    hideWelcome();
    const msg = document.createElement("div");
    msg.className = "message message-ai";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = `<div class="typing-indicator" aria-label="Thinking"><span></span><span></span><span></span></div>`;
    msg.appendChild(bubble);
    els.chatArea.appendChild(msg);
    scrollChatToBottom();
    return msg;
  }

  function fillAiMessage(msgEl, text) {
    const bubble = msgEl.querySelector(".message-bubble");
    bubble.innerHTML = formatMessage(text);

    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "msg-action-btn";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard(text);
      showToast(ok ? "Copied to clipboard." : "Copy failed.");
    });

    actions.appendChild(copyBtn);
    bubble.appendChild(actions);
    scrollChatToBottom();
  }

  function appendStreamingChunk(msgEl, chunk) {
    const bubble = msgEl.querySelector(".message-bubble");
    // Remove typing indicator if present
    const ti = bubble.querySelector(".typing-indicator");
    if (ti) ti.remove();
    // Track text in a data attribute for safe re-format
    const prev = bubble.getAttribute("data-text") || "";
    const next = prev + chunk;
    bubble.setAttribute("data-text", next);
    bubble.innerHTML = formatMessage(next);
    scrollChatToBottom();
  }

  function renderErrorMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message message-ai message-error";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;
    msg.appendChild(bubble);
    els.chatArea.appendChild(msg);
    scrollChatToBottom();
    return msg;
  }

  /* ---------- Prompt Building ---------- */

  function buildFinalPrompt(userText) {
    const modeInstruction = MODE_INSTRUCTIONS[state.selectedMode] || MODE_INSTRUCTIONS.normal;
    const codeExtra = state.codeAssistOn && state.selectedMode !== "code" ? "\n" + CODE_ASSIST_EXTRA : "";

    // Build recent context (skip the just-added user message; we add it at the end)
    const history = state.messages.slice(-MAX_CONTEXT_MESSAGES);
    let convo = "";
    for (const m of history) {
      const tag = m.role === "user" ? "User" : "Assistant";
      convo += `${tag}: ${m.content}\n`;
    }

    const finalPrompt =
      `${modeInstruction}${codeExtra}\n\n` +
      (convo ? `Recent conversation:\n${convo}\n` : "") +
      `User: ${userText}\nAssistant:`;

    return finalPrompt;
  }

  /* ---------- Response Extraction ---------- */

  function extractResponseText(response) {
    if (response == null) return "";
    if (typeof response === "string") return response;

    // Direct text fields
    if (typeof response.text === "string") return response.text;

    // message.content
    if (response.message) {
      const m = response.message;
      if (typeof m === "string") return m;
      if (typeof m.content === "string") return m.content;
      if (Array.isArray(m.content)) {
        return m.content
          .map((c) => (typeof c === "string" ? c : (c && (c.text || c.content)) || ""))
          .filter(Boolean)
          .join("");
      }
    }

    // content
    if (typeof response.content === "string") return response.content;
    if (Array.isArray(response.content)) {
      return response.content
        .map((c) => (typeof c === "string" ? c : (c && (c.text || c.content)) || ""))
        .filter(Boolean)
        .join("");
    }

    // OpenAI-style choices
    if (Array.isArray(response.choices) && response.choices[0]) {
      const ch = response.choices[0];
      if (ch.message && typeof ch.message.content === "string") return ch.message.content;
      if (typeof ch.text === "string") return ch.text;
      if (ch.delta && typeof ch.delta.content === "string") return ch.delta.content;
    }

    // toString fallback (avoid [object Object])
    try {
      const s = JSON.stringify(response);
      if (s && s !== "{}" && s !== "[]") {
        // Heuristic: if it stringifies cleanly, surface that as last resort
        return "";
      }
    } catch (e) { /* ignore */ }

    return "";
  }

  /* ---------- Send Message Flow ---------- */

  async function sendMessage(opts = {}) {
    if (state.sending) return;

    const isRegenerate = opts.regenerate === true;
    let userText;

    if (isRegenerate) {
      // Use the last user message; remove the last assistant message if any
      const lastUserIdx = [...state.messages].reverse().findIndex((m) => m.role === "user");
      if (lastUserIdx === -1) return;
      const lastUser = state.messages[state.messages.length - 1 - lastUserIdx];
      userText = lastUser.content;

      // Remove last assistant entry from state and DOM if present
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].role === "assistant") {
          const m = state.messages[i];
          if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
          state.messages.splice(i, 1);
          break;
        }
      }
    } else {
      userText = (els.userInput.value || "").trim();
      if (!userText) return;
    }

    // Verify Puter.js is loaded
    if (typeof puter === "undefined" || !puter.ai || typeof puter.ai.chat !== "function") {
      renderErrorMessage("Puter.js did not load. Please check your internet connection and refresh the page.");
      return;
    }

    // Render user message (only when not regenerating; regenerate keeps existing user bubble)
    if (!isRegenerate) {
      const userEl = renderUserMessage(userText);
      state.messages.push({ role: "user", content: userText, el: userEl });
      els.userInput.value = "";
      autosizeTextarea();
      updateCharCount();
      saveChatHistory();
    } else {
      // Regenerate already removed the previous assistant entry — persist that change too
      saveChatHistory();
    }

    // Lock UI
    setSending(true);

    const aiMsgEl = renderAiPlaceholder();
    const finalPrompt = buildFinalPrompt(userText);

    let aiText = "";
    let usedFallback = false;

    try {
      aiText = await callPuterAi(finalPrompt, state.selectedModel, aiMsgEl);
    } catch (err) {
      console.warn("[BlackCoreAI] Primary model failed:", err);

      // Try secondary default if primary fails and primary isn't already secondary
      const primary = state.selectedModel;
      try {
        if (primary !== SAFE_DEFAULT_MODEL) {
          aiText = await callPuterAi(finalPrompt, SAFE_DEFAULT_MODEL, aiMsgEl);
          usedFallback = true;
        } else if (primary !== SECONDARY_DEFAULT_MODEL) {
          aiText = await callPuterAi(finalPrompt, SECONDARY_DEFAULT_MODEL, aiMsgEl);
          usedFallback = true;
        }
      } catch (err2) {
        console.warn("[BlackCoreAI] Secondary model failed:", err2);
      }
    }

    if (!aiText || !aiText.trim()) {
      // Replace placeholder with error
      const bubble = aiMsgEl.querySelector(".message-bubble");
      bubble.innerHTML = "";
      aiMsgEl.classList.add("message-error");
      bubble.textContent = "This model may not be available right now. Please switch models and try again.";
      setSending(false);
      return;
    }

    fillAiMessage(aiMsgEl, aiText);
    state.messages.push({ role: "assistant", content: aiText, el: aiMsgEl });
    saveChatHistory();

    if (usedFallback) {
      showToast("Selected model failed. Used a fallback model.", 3000);
    }

    setSending(false);
  }

  async function callPuterAi(prompt, model, msgEl) {
    // Try streaming first if enabled
    if (state.streaming) {
      try {
        const streamResp = await puter.ai.chat(prompt, { model, stream: true });
        if (streamResp && typeof streamResp[Symbol.asyncIterator] === "function") {
          let acc = "";
          for await (const part of streamResp) {
            const piece = extractResponseText(part) || (typeof part === "string" ? part : "");
            if (piece) {
              acc += piece;
              appendStreamingChunk(msgEl, piece);
            }
          }
          if (acc) return acc;
        } else if (streamResp) {
          // Not actually streamed; treat as normal
          const text = extractResponseText(streamResp);
          if (text) return text;
        }
      } catch (e) {
        console.warn("[BlackCoreAI] Streaming failed, falling back to normal:", e);
      }
    }

    // Normal call
    const response = await puter.ai.chat(prompt, { model });
    const text = extractResponseText(response);
    return text || "";
  }

  function setSending(sending) {
    state.sending = sending;
    els.sendBtn.disabled = sending;
    els.regenerateBtn.disabled = sending || !hasUserMessage();
    els.userInput.disabled = sending;
    els.sendBtn.textContent = sending ? "Thinking..." : "Send";
  }

  function hasUserMessage() {
    return state.messages.some((m) => m.role === "user");
  }

  /* ---------- Chat Utilities ---------- */

  function clearChat() {
    state.messages = [];
    els.chatArea.innerHTML = "";
    // Re-add welcome
    const sys = document.createElement("div");
    sys.className = "message message-system";
    sys.id = "welcomeMessage";
    sys.innerHTML = `<div class="message-bubble"><p>Welcome to BlackCoreAI. Choose a model, type anything, or enable Code Assistant for coding help.</p></div>`;
    els.chatArea.appendChild(sys);
    els.welcomeMessage = sys;
    els.regenerateBtn.disabled = true;
    clearSavedChat();
    showToast("Chat cleared.");
  }

  function buildPlainTextChat() {
    if (state.messages.length === 0) return "";
    const lines = state.messages.map((m) => {
      const tag = m.role === "user" ? "You" : "BlackCoreAI";
      return `${tag}:\n${m.content}\n`;
    });
    return lines.join("\n");
  }

  async function copyWholeChat() {
    const text = buildPlainTextChat();
    if (!text) {
      showToast("No chat to copy.");
      return;
    }
    const ok = await copyToClipboard(text);
    showToast(ok ? "Chat copied." : "Copy failed.");
  }

  function exportChat() {
    const text = buildPlainTextChat();
    if (!text) {
      showToast("No chat to export.");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blackcoreai-chat.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Chat exported.");
  }

  /* ---------- Textarea & Input ---------- */

  function autosizeTextarea() {
    const ta = els.userInput;
    ta.style.height = "auto";
    const max = 180;
    ta.style.height = Math.min(ta.scrollHeight, max) + "px";
  }

  function updateCharCount() {
    const len = els.userInput.value.length;
    const max = els.userInput.maxLength || 8000;
    els.charCount.textContent = `${len} / ${max}`;
  }

  /* ---------- Settings Modal ---------- */

  function openSettings() {
    els.settingsModal.classList.add("is-open");
    els.settingsModal.setAttribute("aria-hidden", "false");
  }

  function closeSettings() {
    els.settingsModal.classList.remove("is-open");
    els.settingsModal.setAttribute("aria-hidden", "true");
  }

  /* ---------- Event Wiring ---------- */

  function wireEvents() {
    // Send button
    els.sendBtn.addEventListener("click", () => sendMessage());

    // Regenerate
    els.regenerateBtn.addEventListener("click", () => sendMessage({ regenerate: true }));

    // Enter to send, Shift+Enter newline
    els.userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    els.userInput.addEventListener("input", () => {
      autosizeTextarea();
      updateCharCount();
    });

    // Model select (main)
    els.modelSelect.addEventListener("change", () => {
      state.selectedModel = els.modelSelect.value;
      els.modelSelectSettings.value = state.selectedModel;
      safeSet(STORAGE_KEYS.model, state.selectedModel);
    });

    // Model select (settings)
    els.modelSelectSettings.addEventListener("change", () => {
      state.selectedModel = els.modelSelectSettings.value;
      els.modelSelect.value = state.selectedModel;
      safeSet(STORAGE_KEYS.model, state.selectedModel);
    });

    // Mode select (main)
    els.modeSelect.addEventListener("change", () => {
      state.selectedMode = els.modeSelect.value;
      els.modeSelectSettings.value = state.selectedMode;
      safeSet(STORAGE_KEYS.mode, state.selectedMode);
    });

    // Mode select (settings)
    els.modeSelectSettings.addEventListener("change", () => {
      state.selectedMode = els.modeSelectSettings.value;
      els.modeSelect.value = state.selectedMode;
      safeSet(STORAGE_KEYS.mode, state.selectedMode);
    });

    // Refresh models (both)
    const onRefresh = async () => {
      els.refreshModelsBtn.disabled = true;
      els.refreshModelsBtnSettings.disabled = true;
      try {
        await loadModels();
      } finally {
        els.refreshModelsBtn.disabled = false;
        els.refreshModelsBtnSettings.disabled = false;
      }
    };
    els.refreshModelsBtn.addEventListener("click", onRefresh);
    els.refreshModelsBtnSettings.addEventListener("click", onRefresh);

    // Code assist toggle
    els.codeAssistBtn.addEventListener("click", toggleCodeAssist);

    // Settings open/close
    els.settingsBtn.addEventListener("click", openSettings);
    els.closeSettingsBtn.addEventListener("click", closeSettings);
    els.settingsModal.addEventListener("click", (e) => {
      if (e.target === els.settingsModal) closeSettings();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.settingsModal.classList.contains("is-open")) {
        closeSettings();
      }
    });

    // Theme
    els.themeSelect.addEventListener("change", () => {
      const t = els.themeSelect.value;
      applyTheme(t);
      safeSet(STORAGE_KEYS.theme, t);
    });

    // Font size
    els.fontSizeSelect.addEventListener("change", () => {
      const f = els.fontSizeSelect.value;
      applyFontSize(f);
      safeSet(STORAGE_KEYS.fontSize, f);
    });

    // Streaming
    els.streamingSelect.addEventListener("change", () => {
      state.streaming = els.streamingSelect.value === "on";
      safeSet(STORAGE_KEYS.streaming, state.streaming ? "on" : "off");
    });

    // Save Chat History
    els.saveHistorySelect.addEventListener("change", () => {
      const on = els.saveHistorySelect.value === "on";
      state.saveHistory = on;
      safeSet(STORAGE_KEYS.saveHistory, on ? "on" : "off");
      if (on) {
        saveChatHistory();
        showToast("Chat history saving enabled.");
      } else {
        clearSavedChat();
        showToast("Saved chat history removed from this device.");
      }
    });

    // Clear chat
    els.clearChatBtn.addEventListener("click", () => {
      if (confirm("Clear all chat messages?")) clearChat();
    });

    // Copy chat
    els.copyChatBtn.addEventListener("click", copyWholeChat);

    // Export chat
    els.exportChatBtn.addEventListener("click", exportChat);

    // GCash copy
    els.copyGcashBtn.addEventListener("click", async () => {
      const ok = await copyToClipboard("09482887486");
      els.gcashCopyStatus.textContent = ok ? "GCash number copied!" : "Could not copy. Number: 09482887486";
      showToast(ok ? "GCash number copied!" : "Copy failed. Number visible above.");
      setTimeout(() => { els.gcashCopyStatus.textContent = ""; }, 3000);
    });
  }

  /* ---------- Boot ---------- */

  function checkPuterReady() {
    if (typeof puter === "undefined") {
      renderErrorMessage("Puter.js did not load. Please check your internet connection and refresh the page.");
      return false;
    }
    return true;
  }

  async function init() {
    loadSettings();
    wireEvents();
    autosizeTextarea();
    updateCharCount();

    // Populate selects with fallback first so UI is responsive even if Puter is slow
    populateModelSelects(dedupeModels(FALLBACK_MODELS));

    // Restore previous chat if user opted in (default ON)
    if (state.saveHistory) {
      const restored = restoreSavedChat();
      if (restored > 0) {
        showToast(`Restored ${restored} saved messages.`, 2400);
      }
    }

    // Check Puter availability (non-blocking warn)
    if (typeof puter === "undefined") {
      // Try waiting briefly for late load
      await new Promise((r) => setTimeout(r, 600));
    }

    if (!checkPuterReady()) {
      // We still let the user adjust settings; sendMessage will show the error too
      return;
    }

    // Try dynamic models silently on boot
    await loadModels({ silent: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
