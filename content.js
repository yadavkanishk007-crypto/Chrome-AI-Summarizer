// content.js — listens for messages to show an overlay summary on the page

function createOverlay() {
  if (document.getElementById("gs-summary-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "gs-summary-overlay";
  overlay.style.position = "fixed";
  overlay.style.right = "20px";
  overlay.style.bottom = "20px";
  overlay.style.maxWidth = "420px";
  overlay.style.zIndex = 2147483647;
  overlay.style.background = "rgba(255,255,255,0.98)";
  overlay.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)";
  overlay.style.borderRadius = "10px";
  overlay.style.padding = "12px";
  overlay.style.fontFamily = "Segoe UI, sans-serif";
  overlay.style.color = "#111";
  overlay.style.maxHeight = "60vh";
  overlay.style.overflow = "auto";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "6px";
  closeBtn.style.right = "8px";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.fontSize = "18px";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => overlay.remove();

  const title = document.createElement("div");
  title.textContent = "AI Summary";
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";

  const body = document.createElement("div");
  body.id = "gs-summary-body";
  body.style.whiteSpace = "pre-wrap";

  overlay.appendChild(closeBtn);
  overlay.appendChild(title);
  overlay.appendChild(body);
  document.body.appendChild(overlay);
  return overlay;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === "showSummaryOverlay" && msg.summary) {
    const overlay = createOverlay();
    const body = overlay.querySelector("#gs-summary-body");
    body.textContent = msg.summary;
  }
});
