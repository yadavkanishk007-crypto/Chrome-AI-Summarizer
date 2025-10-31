// © 2025 Kanishk Yadav - Licensed under the MIT License

const API_KEY = "AIzaSyDNl3LQpm2IoklbC8marfhnE1Yg5oU3Rec";
const MODEL = "models/gemini-2.5-flash";

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize-selection",
    title: "Summarize selected text (Gemini)",
    contexts: ["selection"]
  });
});

// Respond to messages from popup/content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.action === "summarize") {
    // request: { action: "summarize", text, mode }
    summarizeWithGemini(request.text, request.mode || "brief")
      .then(summary => sendResponse({ success: true, summary }))
      .catch(err => sendResponse({ success: false, error: err.message || String(err) }));
    return true;
  }
  // overlay ask (ad-hoc assistant)
  if (request?.action === "askGemini") {
    summarizeWithGemini(request.text, request.mode || "brief")
      .then(summary => sendResponse({ success: true, summary }))
      .catch(err => sendResponse({ success: false, error: err.message || String(err) }));
    return true;
  }
});

// Context menu click handling
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "summarize-selection") return;
  const selection = (info.selectionText || "").trim();
  if (!selection) return;

  try {
    const summary = await summarizeWithGemini(selection, "brief");
    await saveToHistory({
      source: tab?.url || "",
      excerpt: selection.slice(0, 200),
      summary,
      timestamp: Date.now()
    });
    // Send overlay display to content script
    chrome.tabs.sendMessage(tab.id, { action: "showSummaryOverlay", summary });
  } catch (err) {
    console.error("Context menu summarization failed:", err);
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icon48.png",
      title: "Summarization failed",
      message: err?.message || "Gemini API error"
    });
  }
});

// Summarize via Gemini
async function summarizeWithGemini(text, mode = "brief") {
  const styleMap = {
    brief: "Summarize briefly in 3 short lines:",
    detailed: "Provide a detailed summary (5-7 sentences):",
    bullets: "Summarize in clear bullet points:",
    insight: "Provide key insights and main takeaways:"
  };
  const promptPrefix = styleMap[mode] || "Summarize this text:";

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;
  const body = {
    contents: [
      { parts: [{ text: `${promptPrefix}\n\n${String(text).slice(0, 6000)}` }] }
    ]
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Gemini API error:", data);
    throw new Error(data?.error?.message || `Gemini error ${res.status}`);
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
}

// Save history (keep up to 200)
async function saveToHistory(entry) {
  const { history = [] } = await chrome.storage.local.get({ history: [] });
  history.unshift(entry);
  if (history.length > 200) history.length = 200;
  await chrome.storage.local.set({ history });
}
