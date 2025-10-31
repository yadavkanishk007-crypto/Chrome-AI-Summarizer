// overlay.js
(function() {
  const overlay = document.createElement("div");
  overlay.id = "gemini-overlay";
  overlay.innerHTML = `
    <div id="gemini-chatbox">
      <textarea id="gemini-input" placeholder="Ask Gemini..."></textarea>
      <button id="gemini-send">Send</button>
      <div id="gemini-response"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Add CSS
  const style = document.createElement("style");
  style.textContent = `
    #gemini-overlay {
      position: fixed; bottom: 20px; right: 20px;
      width: 350px; background: white; border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 999999; font-family: system-ui;
      display: flex; flex-direction: column; padding: 10px;
    }
    #gemini-input {
      width: 100%; height: 60px; border-radius: 8px; padding: 6px;
    }
    #gemini-send { margin-top: 5px; padding: 6px 12px; cursor: pointer; }
    #gemini-response { margin-top: 10px; overflow-y: auto; max-height: 300px; }
  `;
  document.head.appendChild(style);

  const input = overlay.querySelector("#gemini-input");
  const send = overlay.querySelector("#gemini-send");
  const responseDiv = overlay.querySelector("#gemini-response");

  send.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    responseDiv.innerHTML = `<em>Thinking...</em>`;

    chrome.runtime.sendMessage({ action: "askGemini", prompt: text }, (res) => {
      if (res.success) {
        responseDiv.innerHTML = marked.parse(res.reply);
      } else {
        responseDiv.innerHTML = `<span style='color:red'>Error: ${res.error}</span>`;
      }
    });
  });
})();
