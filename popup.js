// © 2025 Kanishk Yadav - Licensed under the MIT License

document.addEventListener("DOMContentLoaded", init);

function init() {
  // Tabs
  document.getElementById("tabSummarize").addEventListener("click", () => showTab("summarize"));
  document.getElementById("tabHistory").addEventListener("click", () => showTab("history"));

  // Buttons
  document.getElementById("summarizeBtn").addEventListener("click", handleSummarizePage);
  document.getElementById("summarizeSelectionBtn").addEventListener("click", handleSummarizeSelection);
  document.getElementById("copyBtn").addEventListener("click", copySummary);
  document.getElementById("saveBtn").addEventListener("click", saveCurrentSummary);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  // Restore theme
  chrome.storage.local.get(["theme"], (res) => {
    if (res.theme === "dark") document.body.classList.add("dark");
  });

  loadHistory();
  showTab("summarize");
}

function showTab(tab) {
  document.getElementById("tabSummarize").classList.toggle("active", tab === "summarize");
  document.getElementById("tabHistory").classList.toggle("active", tab === "history");
  document.getElementById("panelSummarize").classList.toggle("hidden", tab !== "summarize");
  document.getElementById("panelHistory").classList.toggle("hidden", tab !== "history");
}

function setLoading(on) {
  document.getElementById("loader").classList.toggle("hidden", !on);
}

async function handleSummarizePage() {
  setLoading(true);
  const output = document.getElementById("output");
  output.innerHTML = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText.slice(0, 8000)
    });

    const mode = document.getElementById("summaryType").value;
    const summary = await requestSummary(result, mode);

    renderMarkdown(summary);
    showActionButtons();
  } catch (err) {
    console.error(err);
    document.getElementById("output").textContent = "⚠️ " + (err.message || "Error summarizing");
  } finally {
    setLoading(false);
  }
}

async function handleSummarizeSelection() {
  setLoading(true);
  const output = document.getElementById("output");
  output.innerHTML = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.getSelection ? window.getSelection().toString() : "")
    });

    if (!result || !result.trim()) {
      output.textContent = "⚠️ No text selected on this page.";
      setLoading(false);
      return;
    }

    const mode = document.getElementById("summaryType").value;
    const summary = await requestSummary(result, mode);

    // Save history entry
    const entry = { source: tab.url || "", excerpt: result.slice(0, 150), summary, timestamp: Date.now() };
    await saveToHistory(entry);

    renderMarkdown(summary);
    showActionButtons();
  } catch (err) {
    console.error(err);
    document.getElementById("output").textContent = "⚠️ " + (err.message || "Error summarizing selection");
  } finally {
    setLoading(false);
  }
}

function requestSummary(text, mode = "brief") {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "summarize", text, mode }, (res) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!res || !res.success) return reject(new Error(res?.error || "Summarization failed"));
      resolve(res.summary);
    });
  });
}

function renderMarkdown(md) {
  const out = document.getElementById("output");
  if (!md) {
    out.innerHTML = "<div class='empty'>No summary generated.</div>";
    return;
  }
  out.innerHTML = marked.parse(md);
}

function showActionButtons() {
  document.getElementById("copyBtn").classList.remove("hidden");
  document.getElementById("saveBtn").classList.remove("hidden");
}

function copySummary() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  // visual feedback
  alert("✅ Summary copied to clipboard");
}

async function saveCurrentSummary() {
  const summary = document.getElementById("output").innerText;
  if (!summary || !summary.trim()) return alert("No summary to save.");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const entry = { source: tab.url || "", excerpt: summary.slice(0, 150), summary, timestamp: Date.now() };
  await saveToHistory(entry);
  alert("Saved to history.");
}

async function saveToHistory(entry) {
  const { history = [] } = await chrome.storage.local.get({ history: [] });
  history.unshift(entry);
  if (history.length > 200) history.length = 200;
  await chrome.storage.local.set({ history });
  loadHistory();
}

async function loadHistory() {
  const { history = [] } = await chrome.storage.local.get({ history: [] });
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  if (!history.length) {
    list.innerHTML = "<div class='empty'>No saved summaries yet.</div>";
    return;
  }
  for (const item of history) {
    const row = document.createElement("div");
    row.className = "historyItem";
    const time = new Date(item.timestamp).toLocaleString();
    row.innerHTML = `
      <div class="hExcerpt">${escapeHtml(item.excerpt)}</div>
      <div class="hSummary">${escapeHtml(truncate(item.summary, 400))}</div>
      <div class="hMeta">${time} • <a class="openFull" href="#" data-url="${item.source}">Open</a> <button class="del">Delete</button></div>
    `;
    row.querySelector(".openFull").addEventListener("click", (e) => {
      e.preventDefault();
      showFullInPopup(item);
    });
    row.querySelector(".del").addEventListener("click", async () => {
      await removeHistoryItem(item.timestamp);
    });
    list.appendChild(row);
  }
}

function showFullInPopup(item) {
  showTab("summarize");
  renderMarkdown(item.summary);
  showActionButtons();
}

async function removeHistoryItem(ts) {
  const { history = [] } = await chrome.storage.local.get({ history: [] });
  const newHistory = history.filter(h => h.timestamp !== ts);
  await chrome.storage.local.set({ history: newHistory });
  loadHistory();
}

async function clearHistory() {
  await chrome.storage.local.set({ history: [] });
  loadHistory();
}

function truncate(s, n) { return s?.length > n ? s.slice(0, n) + "..." : (s || ""); }
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
}
