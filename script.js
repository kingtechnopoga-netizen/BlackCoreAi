/* =========================================================
   BlackCoreAI — script.js
   Vanilla JS chatbot powered by Puter.js
   Premium dark-tech UI build
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Constants ---------- */

  const STORAGE_KEYS = {
    theme:         "bcai.theme",
    fontSize:      "bcai.fontSize",
    model:         "bcai.model",
    mode:          "bcai.mode",
    streaming:     "bcai.streaming",
    codeAssist:    "bcai.codeAssist",
    saveHistory:   "bcai.saveHistory",
    chatHistory:   "bcai.chatHistory",
    responseStyle: "bcai.responseStyle",
  };

  const SAFE_DEFAULT_MODEL = "gpt-5-nano";
  const SECONDARY_DEFAULT_MODEL = "gpt-4.1-nano";
  const MAX_CONTEXT_MESSAGES = 12;
  const HISTORY_MAX_BYTES = 800000;

  /* Curated fallback model list */
  const FALLBACK_MODELS = [
    // OpenAI
    { id: "gpt-5-nano",            label: "GPT-5 Nano · Fast",         group: "OpenAI" },
    { id: "openai/gpt-5-mini",     label: "GPT-5 Mini · Balanced",     group: "OpenAI" },
    { id: "openai/gpt-5-chat",     label: "GPT-5 Chat · Smart",        group: "OpenAI" },
    { id: "openai/gpt-5.3-chat",   label: "GPT-5.3 Chat",              group: "OpenAI" },
    { id: "openai/gpt-5.4-nano",   label: "GPT-5.4 Nano · Latest",     group: "OpenAI" },
    { id: "gpt-4.1-nano",          label: "GPT-4.1 Nano",              group: "OpenAI" },
    { id: "gpt-4.1-mini",          label: "GPT-4.1 Mini",              group: "OpenAI" },
    { id: "gpt-4o-mini",           label: "GPT-4o Mini",               group: "OpenAI" },

    // Anthropic
    { id: "anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5 · Coding", group: "Anthropic" },
    { id: "anthropic/claude-opus-4.5",   label: "Claude Opus 4.5 · Advanced", group: "Anthropic" },
    { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6",          group: "Anthropic" },
    { id: "claude-sonnet-4",             label: "Claude Sonnet 4",            group: "Anthropic" },
    { id: "claude-3-5-sonnet",           label: "Claude 3.5 Sonnet",          group: "Anthropic" },

    // Google
    { id: "google/gemini-3-pro",     label: "Gemini 3 Pro · Advanced", group: "Google" },
    { id: "google/gemini-2.5-pro",   label: "Gemini 2.5 Pro",          group: "Google" },
    { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash · Fast", group: "Google" },
    { id: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash",        group: "Google" },

    // xAI
    { id: "xai/grok-4", label: "Grok 4", group: "xAI" },
    { id: "xai/grok-3", label: "Grok 3", group: "xAI" },

    // DeepSeek
    { id: "deepseek/deepseek-chat",      label: "DeepSeek Chat · Coding", group: "DeepSeek" },
    { id: "deepseek/deepseek-reasoner",  label: "DeepSeek Reasoner",      group: "DeepSeek" },
    { id: "deepseek-chat",               label: "DeepSeek Chat",          group: "DeepSeek" },

    // Meta
    { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", label: "Llama 3.1 8B Turbo",       group: "Meta" },
    { id: "meta-llama/llama-3.3-70b-instruct",           label: "Llama 3.3 70B Instruct",   group: "Meta" },

    // Mistral
    { id: "mistral/mistral-large-latest", label: "Mistral Large · General", group: "Mistral" },
    { id: "mistral-large-latest",         label: "Mistral Large (latest)",  group: "Mistral" },
    { id: "mistral/codestral-latest",     label: "Codestral · Code",        group: "Mistral" },

    // Qwen
    { id: "qwen/qwen3.7-max",  label: "Qwen 3.7 Max",       group: "Qwen" },
    { id: "qwen/qwen3.6-plus", label: "Qwen 3.6 Plus",      group: "Qwen" },
    { id: "qwen/qwen3.5-plus", label: "Qwen 3.5 Plus",      group: "Qwen" },
    { id: "qwen/qwen3-coder",  label: "Qwen Coder · Code",  group: "Qwen" },
    { id: "qwen/qwq-32b",      label: "Qwen QwQ 32B",       group: "Qwen" },

    // NVIDIA
    { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1", label: "Nemotron Ultra · Reasoning", group: "NVIDIA" },
  ];

  /* Mode instructions */
  const MODE_INSTRUCTIONS = {
    general:    "You are BlackCoreAI, a refined and intelligent AI assistant. Give clear, accurate, useful, and direct answers. Match the user's tone and depth.",
    code:       "You are BlackCoreAI Coding Assistant. Help with clean, working, production-ready code. Explain errors clearly and provide complete fixed code when needed. Prioritize correctness, modern patterns, and mobile-friendly design when relevant.",
    debug:      "You are BlackCoreAI Debugging Mode. Diagnose bugs methodically: identify the root cause, explain why it happens, and provide a complete corrected version. Prefer minimal diffs and clear reasoning.",
    creative:   "You are BlackCoreAI Creative Writer. Produce original, emotional, natural, non-generic writing. Avoid robotic phrasing and clichés. Make output engaging and ready to use.",
    prompt:     "You are BlackCoreAI Prompt Engineer. Improve prompts to be clear, structured, and copy-ready for AI builders, image/video generators, and coding agents. Output the final prompt only unless asked otherwise.",
    study:      "You are BlackCoreAI Study Helper. Explain concepts in simple, accurate language with one short example or analogy. Avoid unnecessary jargon. Offer step-by-step reasoning when helpful.",
    business:   "You are BlackCoreAI Business Mode. Craft professional names, bios, captions, product descriptions, sales copy, and marketing ideas. Make output trustworthy, polished, and brand-safe.",
    summarizer: "You are BlackCoreAI Summarizer. Condense the user's input into a clear, faithful summary. Default to 3-5 concise bullet points unless the user requests another format.",
    translator: "You are BlackCoreAI Translator. Translate the user's text accurately while preserving meaning, tone, and nuance. If the source or target language is ambiguous, ask once for clarification.",
    tagalog:    "You are BlackCoreAI Tagalog Assistant. Answer naturally in Tagalog or Taglish. Keep the tone friendly, clear, and useful.",

    /* ---- Backward-compat keys (so old saved prefs still work) ---- */
    normal:     "You are BlackCoreAI, a refined and intelligent AI assistant. Give clear, accurate, useful, and direct answers.",
    research:   "You are BlackCoreAI Research Assistant. Answer carefully and clearly. If real-time information is uncertain, say so. Do not invent sources.",
    beginner:   "You are BlackCoreAI Study Helper. Explain things in simple words with examples. Avoid unnecessary jargon.",
    social:     "You are BlackCoreAI Social Media Helper. Help create viral-style hooks, captions, hashtags, bios, and short scripts. Keep content natural and engaging.",
    cyber:      "You are BlackCoreAI Cyber Study Assistant. Help only with ethical cybersecurity learning, defensive security, and best practices. Refuse illegal hacking, fraud, phishing, malware, credential theft, carding, or bypass instructions.",
  };

  const CODE_ASSIST_EXTRA = "Additionally, act as a Code Assistant: provide clean, complete, working code examples. Explain logic briefly. When fixing code, return the full corrected version. Prefer modern, beginner-friendly, mobile-friendly patterns.";

  const RESPONSE_STYLE_INSTRUCTIONS = {
    balanced: "Default style: balanced length, clear structure, no fluff.",
    concise:  "Style: be brief and to the point. Prefer short sentences and tight bullets. Skip preamble.",
    detailed: "Style: provide thorough, well-structured answers with clear sections. Include reasoning, edge cases, and examples when useful.",
    creative: "Style: be expressive, vivid, and original. Vary sentence rhythm. Avoid generic phrasing.",
  };

  /* ---------- State ---------- */

  const state = {
    messages: [],
    sending: false,
    currentModels: [],
    selectedModel: SAFE_DEFAULT_MODEL,
    selectedMode: "general",
    codeAssistOn: false,
    streaming: false,
    saveHistory: true,
    responseStyle: "balanced",
  };

  /* ---------- DOM ---------- */

  const $ = (id) => document.getElementById(id);

  const els = {
    // Header
    newChatBtn:       $("newChatBtn"),
    themeToggleBtn:   $("themeToggleBtn"),
    settingsBtn:      $("settingsBtn"),

    // Chat surface
    chatArea:         $("chatArea"),
    welcomeScreen:    $("welcomeScreen"),

    // Composer
    userInput:        $("userInput"),
    sendBtn:          $("sendBtn"),
    regenerateBtn:    $("regenerateBtn"),
    charCount:        $("charCount"),

    // Control bar
    modelSelect:      $("modelSelect"),
    modeSelect:       $("modeSelect"),
    refreshModelsBtn: $("refreshModelsBtn"),
    codeAssistToggle: $("codeAssistToggle"),
    codeBadge:        $("codeBadge"),

    // Utility row
    utilityNewChatBtn: $("utilityNewChatBtn"),
    copyChatBtn:       $("copyChatBtn"),
    exportChatBtn:     $("exportChatBtn"),
    clearChatBtn:      $("clearChatBtn"),

    // Settings modal
    settingsModal:        $("settingsModal"),
    closeSettingsBtn:     $("closeSettingsBtn"),
    themeSelect:          $("themeSelect"),
    fontSizeSelect:       $("fontSizeSelect"),
    responseStyleSelect:  $("responseStyleSelect"),
    streamingSelect:      $("streamingSelect"),
    saveHistorySelect:    $("saveHistorySelect"),

    // Settings utilities
    clearChatBtnSettings:    $("clearChatBtnSettings"),
    copyChatBtnSettings:     $("copyChatBtnSettings"),
    exportChatBtnSettings:   $("exportChatBtnSettings"),
    refreshModelsBtnSettings:$("refreshModelsBtnSettings"),

    // Donation
    gcashNumber:    $("gcashNumber"),
    copyGcashBtn:   $("copyGcashBtn"),
    gcashCopyStatus:$("gcashCopyStatus"),

    // Toast
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
   * Safe formatter: code fences, inline code, and line breaks.
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
    } catch (e) { /* fall through */ }
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

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  /* ---------- Settings & Persistence ---------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#F4F5F2" : "#0B0D0F");
  }

  function applyFontSize(size) {
    document.documentElement.setAttribute("data-font", size || "medium");
  }

  function loadSettings() {
    const theme = safeGet(STORAGE_KEYS.theme) || "dark";
    const font = safeGet(STORAGE_KEYS.fontSize) || "medium";
    const model = safeGet(STORAGE_KEYS.model) || SAFE_DEFAULT_MODEL;

    // Mode: migrate legacy "normal" → "general"
    let mode = safeGet(STORAGE_KEYS.mode) || "general";
    if (mode === "normal") mode = "general";

    const streaming = safeGet(STORAGE_KEYS.streaming) === "on";
    const codeAssist = safeGet(STORAGE_KEYS.codeAssist) === "on";
    const savedHistoryPref = safeGet(STORAGE_KEYS.saveHistory);
    const saveHistory = savedHistoryPref === null ? true : savedHistoryPref === "on";
    const responseStyle = safeGet(STORAGE_KEYS.responseStyle) || "balanced";

    applyTheme(theme);
    applyFontSize(font);

    state.selectedModel = model;
    state.selectedMode = mode;
    state.streaming = streaming;
    state.codeAssistOn = codeAssist;
    state.saveHistory = saveHistory;
    state.responseStyle = responseStyle;

    if (els.themeSelect)         els.themeSelect.value = theme;
    if (els.fontSizeSelect)      els.fontSizeSelect.value = font;
    if (els.streamingSelect)     els.streamingSelect.value = streaming ? "on" : "off";
    if (els.saveHistorySelect)   els.saveHistorySelect.value = saveHistory ? "on" : "off";
    if (els.responseStyleSelect) els.responseStyleSelect.value = responseStyle;
    if (els.modeSelect && [...els.modeSelect.options].some((o) => o.value === mode)) {
      els.modeSelect.value = mode;
    }
    if (els.codeAssistToggle)    els.codeAssistToggle.checked = !!codeAssist;
    updateCodeBadge();
  }

  /* ---------- Models ---------- */

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
    if (!raw) return [];
    let arr = [];
    if (Array.isArray(raw)) {
      arr = raw;
    } else if (Array.isArray(raw.models)) {
      arr = raw.models;
    } else if (Array.isArray(raw.data)) {
      arr = raw.data;
    } else if (typeof raw === "object") {
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
    const stripped = id.includes("/") ? id.split("/").slice(1).join("/") : id;
    return stripped.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function populateModelSelect(models) {
    state.currentModels = models;
    if (!els.modelSelect) return;

    els.modelSelect.innerHTML = "";

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
      els.modelSelect.appendChild(og);
    }

    const desired = state.selectedModel;
    const exists = models.some((m) => m.id === desired);
    const finalModel = exists ? desired : (models[0] ? models[0].id : SAFE_DEFAULT_MODEL);
    state.selectedModel = finalModel;
    els.modelSelect.value = finalModel;
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

    const combined = (dynamic && dynamic.length > 0)
      ? dedupeModels([...dynamic, ...FALLBACK_MODELS])
      : dedupeModels(FALLBACK_MODELS);

    populateModelSelect(combined);

    if (!silent) {
      showToast(dynamic.length > 0 ? "Models refreshed." : "Fallback models loaded.");
    }
  }

  /* ---------- Persistent Chat History ---------- */

  function saveChatHistory() {
    if (!state.saveHistory) return;
    try {
      let data = state.messages.map((m) => ({ role: m.role, content: m.content }));
      let json = JSON.stringify(data);
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
    if (els.regenerateBtn) els.regenerateBtn.disabled = !hasUserMessage();
    return arr.length;
  }

  /* ---------- Code Assist toggle ---------- */

  function updateCodeBadge() {
    if (!els.codeBadge) return;
    els.codeBadge.classList.toggle("hidden", !state.codeAssistOn);
  }

  function setCodeAssist(on) {
    state.codeAssistOn = !!on;
    safeSet(STORAGE_KEYS.codeAssist, state.codeAssistOn ? "on" : "off");
    if (els.codeAssistToggle) els.codeAssistToggle.checked = state.codeAssistOn;
    updateCodeBadge();
  }

  /* ---------- Rendering ---------- */

  function hideWelcome() {
    if (els.welcomeScreen && els.welcomeScreen.parentNode) {
      els.welcomeScreen.parentNode.removeChild(els.welcomeScreen);
      els.welcomeScreen = null;
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
    const ti = bubble.querySelector(".typing-indicator");
    if (ti) ti.remove();
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
    const modeInstruction = MODE_INSTRUCTIONS[state.selectedMode] || MODE_INSTRUCTIONS.general;
    const styleInstruction = RESPONSE_STYLE_INSTRUCTIONS[state.responseStyle] || RESPONSE_STYLE_INSTRUCTIONS.balanced;
    const codeExtra = state.codeAssistOn && state.selectedMode !== "code" && state.selectedMode !== "debug"
      ? "\n" + CODE_ASSIST_EXTRA
      : "";

    const history = state.messages.slice(-MAX_CONTEXT_MESSAGES);
    let convo = "";
    for (const m of history) {
      const tag = m.role === "user" ? "User" : "Assistant";
      convo += `${tag}: ${m.content}\n`;
    }

    const finalPrompt =
      `${modeInstruction}\n${styleInstruction}${codeExtra}\n\n` +
      (convo ? `Recent conversation:\n${convo}\n` : "") +
      `User: ${userText}\nAssistant:`;

    return finalPrompt;
  }

  /* ---------- Response Extraction ---------- */

  function extractResponseText(response) {
    if (response == null) return "";
    if (typeof response === "string") return response;

    if (typeof response.text === "string") return response.text;

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

    if (typeof response.content === "string") return response.content;
    if (Array.isArray(response.content)) {
      return response.content
        .map((c) => (typeof c === "string" ? c : (c && (c.text || c.content)) || ""))
        .filter(Boolean)
        .join("");
    }

    if (Array.isArray(response.choices) && response.choices[0]) {
      const ch = response.choices[0];
      if (ch.message && typeof ch.message.content === "string") return ch.message.content;
      if (typeof ch.text === "string") return ch.text;
      if (ch.delta && typeof ch.delta.content === "string") return ch.delta.content;
    }

    return "";
  }

  /* ---------- Send Flow ---------- */

  async function sendMessage(opts = {}) {
    if (state.sending) return;

    const isRegenerate = opts.regenerate === true;
    let userText;

    if (isRegenerate) {
      const lastUserIdx = [...state.messages].reverse().findIndex((m) => m.role === "user");
      if (lastUserIdx === -1) return;
      const lastUser = state.messages[state.messages.length - 1 - lastUserIdx];
      userText = lastUser.content;

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

    if (typeof puter === "undefined" || !puter.ai || typeof puter.ai.chat !== "function") {
      renderErrorMessage("Puter.js did not load. Please check your internet connection and refresh the page.");
      return;
    }

    if (!isRegenerate) {
      const userEl = renderUserMessage(userText);
      state.messages.push({ role: "user", content: userText, el: userEl });
      els.userInput.value = "";
      autosizeTextarea();
      updateCharCount();
      saveChatHistory();
    } else {
      saveChatHistory();
    }

    setSending(true);

    const aiMsgEl = renderAiPlaceholder();
    const finalPrompt = buildFinalPrompt(userText);

    let aiText = "";
    let usedFallback = false;

    try {
      aiText = await callPuterAi(finalPrompt, state.selectedModel, aiMsgEl);
    } catch (err) {
      console.warn("[BlackCoreAI] Primary model failed:", err);
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
          const text = extractResponseText(streamResp);
          if (text) return text;
        }
      } catch (e) {
        console.warn("[BlackCoreAI] Streaming failed, falling back to normal:", e);
      }
    }

    const response = await puter.ai.chat(prompt, { model });
    const text = extractResponseText(response);
    return text || "";
  }

  function setSending(sending) {
    state.sending = sending;
    if (els.sendBtn)       els.sendBtn.disabled = sending;
    if (els.regenerateBtn) els.regenerateBtn.disabled = sending || !hasUserMessage();
    if (els.userInput)     els.userInput.disabled = sending;
  }

  function hasUserMessage() {
    return state.messages.some((m) => m.role === "user");
  }

  /* ---------- Chat Utilities ---------- */

  function buildWelcomeNode() {
    const wrap = document.createElement("div");
    wrap.id = "welcomeScreen";
    wrap.className = "welcome-screen";
    wrap.innerHTML = `
      <div class="welcome-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">
          <path d="M12 2.5 L20.5 7 L20.5 17 L12 21.5 L3.5 17 L3.5 7 Z"/>
          <path d="M12 8.5 L15.5 12 L12 15.5 L8.5 12 Z" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <h2 class="welcome-title">Welcome to BlackCoreAI</h2>
      <p class="welcome-subtitle">A private AI workspace tuned for elite professionals, developers, and power users. Choose a model, pick a mode, and begin.</p>
      <div class="welcome-prompts" role="list" aria-label="Suggested prompts">
        <button class="prompt-chip" type="button" data-prompt="Write a clean, production-ready Python function that validates an email address and returns a structured result." role="listitem"><span class="prompt-chip-icon" aria-hidden="true">›</span><span>Write a clean Python email validator</span></button>
        <button class="prompt-chip" type="button" data-prompt="Draft an elegant, professional landing page hero section with a strong headline, subheadline, and CTA copy for a premium AI product." role="listitem"><span class="prompt-chip-icon" aria-hidden="true">›</span><span>Draft a premium landing-page hero</span></button>
        <button class="prompt-chip" type="button" data-prompt="Explain how transformers work in large language models, in simple but accurate terms, with one analogy." role="listitem"><span class="prompt-chip-icon" aria-hidden="true">›</span><span>Explain how transformers work</span></button>
        <button class="prompt-chip" type="button" data-prompt="Summarize this paragraph into 3 concise bullet points: " role="listitem"><span class="prompt-chip-icon" aria-hidden="true">›</span><span>Summarize text into 3 bullets</span></button>
      </div>
    `;
    return wrap;
  }

  function clearChat({ silent = false } = {}) {
    state.messages = [];
    els.chatArea.innerHTML = "";
    const welcome = buildWelcomeNode();
    els.chatArea.appendChild(welcome);
    els.welcomeScreen = welcome;
    wirePromptChips();
    if (els.regenerateBtn) els.regenerateBtn.disabled = true;
    clearSavedChat();
    if (!silent) showToast("New chat started.");
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
    if (!text) { showToast("No chat to copy."); return; }
    const ok = await copyToClipboard(text);
    showToast(ok ? "Chat copied." : "Copy failed.");
  }

  function exportChat() {
    const text = buildPlainTextChat();
    if (!text) { showToast("No chat to export."); return; }
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

  /* ---------- Composer ---------- */

  function autosizeTextarea() {
    const ta = els.userInput;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 200;
    ta.style.height = Math.min(ta.scrollHeight, max) + "px";
  }

  function updateCharCount() {
    if (!els.userInput || !els.charCount) return;
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

  /* ---------- Welcome Prompt Chips ---------- */

  function wirePromptChips() {
    const chips = document.querySelectorAll(".prompt-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt") || "";
        if (!prompt) return;
        els.userInput.value = prompt;
        els.userInput.focus();
        autosizeTextarea();
        updateCharCount();
        // Place caret at end
        const len = prompt.length;
        try { els.userInput.setSelectionRange(len, len); } catch (e) { /* ignore */ }
      });
    });
  }

  /* ---------- Theme Toggle ---------- */

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    safeSet(STORAGE_KEYS.theme, next);
    if (els.themeSelect) els.themeSelect.value = next;
  }

  /* ---------- Event Wiring ---------- */

  function wireEvents() {
    // Composer
    if (els.sendBtn)       els.sendBtn.addEventListener("click", () => sendMessage());
    if (els.regenerateBtn) els.regenerateBtn.addEventListener("click", () => sendMessage({ regenerate: true }));

    if (els.userInput) {
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
    }

    // Model
    if (els.modelSelect) {
      els.modelSelect.addEventListener("change", () => {
        state.selectedModel = els.modelSelect.value;
        safeSet(STORAGE_KEYS.model, state.selectedModel);
      });
    }

    // Mode
    if (els.modeSelect) {
      els.modeSelect.addEventListener("change", () => {
        state.selectedMode = els.modeSelect.value;
        safeSet(STORAGE_KEYS.mode, state.selectedMode);
      });
    }

    // Refresh models
    const onRefresh = async () => {
      if (els.refreshModelsBtn)         els.refreshModelsBtn.disabled = true;
      if (els.refreshModelsBtnSettings) els.refreshModelsBtnSettings.disabled = true;
      try { await loadModels(); }
      finally {
        if (els.refreshModelsBtn)         els.refreshModelsBtn.disabled = false;
        if (els.refreshModelsBtnSettings) els.refreshModelsBtnSettings.disabled = false;
      }
    };
    if (els.refreshModelsBtn)         els.refreshModelsBtn.addEventListener("click", onRefresh);
    if (els.refreshModelsBtnSettings) els.refreshModelsBtnSettings.addEventListener("click", onRefresh);

    // Code assist toggle (checkbox)
    if (els.codeAssistToggle) {
      els.codeAssistToggle.addEventListener("change", () => setCodeAssist(els.codeAssistToggle.checked));
    }

    // Settings open/close
    if (els.settingsBtn)      els.settingsBtn.addEventListener("click", openSettings);
    if (els.closeSettingsBtn) els.closeSettingsBtn.addEventListener("click", closeSettings);
    if (els.settingsModal) {
      els.settingsModal.addEventListener("click", (e) => {
        if (e.target === els.settingsModal) closeSettings();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.settingsModal && els.settingsModal.classList.contains("is-open")) {
        closeSettings();
      }
    });

    // Header New Chat
    if (els.newChatBtn) els.newChatBtn.addEventListener("click", () => clearChat());

    // Header Theme toggle
    if (els.themeToggleBtn) els.themeToggleBtn.addEventListener("click", toggleTheme);

    // Theme select (settings)
    if (els.themeSelect) {
      els.themeSelect.addEventListener("change", () => {
        const t = els.themeSelect.value;
        applyTheme(t);
        safeSet(STORAGE_KEYS.theme, t);
      });
    }

    // Font size
    if (els.fontSizeSelect) {
      els.fontSizeSelect.addEventListener("change", () => {
        const f = els.fontSizeSelect.value;
        applyFontSize(f);
        safeSet(STORAGE_KEYS.fontSize, f);
      });
    }

    // Response style
    if (els.responseStyleSelect) {
      els.responseStyleSelect.addEventListener("change", () => {
        state.responseStyle = els.responseStyleSelect.value;
        safeSet(STORAGE_KEYS.responseStyle, state.responseStyle);
      });
    }

    // Streaming
    if (els.streamingSelect) {
      els.streamingSelect.addEventListener("change", () => {
        state.streaming = els.streamingSelect.value === "on";
        safeSet(STORAGE_KEYS.streaming, state.streaming ? "on" : "off");
      });
    }

    // Save history
    if (els.saveHistorySelect) {
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
    }

    // Utility row + settings duplicates
    const wireClear = (btn) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        if (state.messages.length === 0) {
          showToast("Chat is already empty.");
          return;
        }
        if (confirm("Clear all chat messages?")) clearChat();
      });
    };
    wireClear(els.clearChatBtn);
    wireClear(els.clearChatBtnSettings);

    if (els.utilityNewChatBtn) els.utilityNewChatBtn.addEventListener("click", () => clearChat());

    if (els.copyChatBtn)         els.copyChatBtn.addEventListener("click", copyWholeChat);
    if (els.copyChatBtnSettings) els.copyChatBtnSettings.addEventListener("click", copyWholeChat);

    if (els.exportChatBtn)         els.exportChatBtn.addEventListener("click", exportChat);
    if (els.exportChatBtnSettings) els.exportChatBtnSettings.addEventListener("click", exportChat);

    // GCash copy
    if (els.copyGcashBtn) {
      els.copyGcashBtn.addEventListener("click", async () => {
        const ok = await copyToClipboard("09482887486");
        if (els.gcashCopyStatus) {
          els.gcashCopyStatus.textContent = ok ? "GCash number copied." : "Could not copy. Number: 09482887486";
        }
        showToast(ok ? "GCash number copied." : "Copy failed. Number visible above.");
        setTimeout(() => {
          if (els.gcashCopyStatus) els.gcashCopyStatus.textContent = "";
        }, 3000);
      });
    }

    // Welcome prompt chips
    wirePromptChips();
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
    populateModelSelect(dedupeModels(FALLBACK_MODELS));

    // Restore previous chat if user opted in (default ON)
    if (state.saveHistory) {
      const restored = restoreSavedChat();
      if (restored > 0) {
        showToast(`Restored ${restored} saved messages.`, 2400);
      }
    }

    // Check Puter availability (give it a moment if it loads late)
    if (typeof puter === "undefined") {
      await new Promise((r) => setTimeout(r, 600));
    }

    if (!checkPuterReady()) return;

    // Try dynamic models silently on boot
    await loadModels({ silent: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
