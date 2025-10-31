# 🧠 Gemini Smart Summarizer
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)


A powerful **Chrome Extension** that uses **Gemini Nano (on-device AI)** to summarize web pages, selections, or custom text — instantly.  
It features a clean UI, light/dark themes, markdown rendering, and full summarization history.  

---

## 🚀 Features

- ✨ **One-click summarization** of web pages or selected text  
- 🧩 **Gemini Nano integration** (via `chrome.runtime.sendMessage`)  
- 💡 **Multiple summary modes** — TL;DR, Detailed, Bullets, and Key Insights  
- 🕶️ **Dark / Light theme toggle**  
- 📝 **Markdown rendering** using [Marked.js](https://marked.js.org/)  
- 💾 **Local history** of all summaries (with Clear option)  
- 📋 **Copy & Save options**  
- ⚡ **Optimized, production-ready codebase**

---

## 🧱 Folder Structure

Gemini-Smart-Summarizer/
│
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── style.css
├── icon16.png
├── icon48.png
├── icon128.png
└── README.md

## ⚙️ Installation (Developer Mode)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/kanishkyadav/gemini-smart-summarizer.git
2. Open Chrome → navigate to:

    chrome://extensions/
3. Enable Developer mode (toggle at top-right).

4. Click Load unpacked → select the extension folder.

5. The 🧠 Gemini Smart Summarizer icon will appear in your Chrome toolbar.

🖥️ Usage

Open any article or webpage.

Click the 🧠 icon to open the popup.

Choose:

Summarize Page

Summarize Selection

or Paste text manually

Select your preferred summary mode:

TL;DR

Detailed

Bullets

Key Insights

The summarized output appears with Markdown formatting.

Copy, Save, or view your summaries in History anytime.

🌗 Theme Support
Click the 🌗 button to toggle between Light and Dark themes.
Your theme preference is automatically saved using Chrome Storage.

🧠 Summary Modes
| Mode             | Description                   |
| ---------------- | ----------------------------- |
| **TL;DR**        | Quick and concise version     |
| **Detailed**     | Full expanded explanation     |
| **Bullets**      | Summarized as key points      |
| **Key Insights** | Extracts actionable takeaways |

🧾 Permissions Used
| Permission     | Purpose                               |
| -------------- | ------------------------------------- |
| `activeTab`    | Access content from the current tab   |
| `storage`      | Save summaries, settings, and history |
| `scripting`    | Inject summarization overlay          |
| `contextMenus` | Add “Summarize Selection” option      |
| `runtime`      | Enable background messaging           |

🧰 Technical Highlights

Uses chrome.runtime.sendMessage for background communication

Asynchronous Chrome API usage with async/await

Dynamic Markdown rendering in popup and overlay

Persistent summary storage via chrome.storage.local

Fast and lightweight UI powered by CSS variables

👨‍💻 Author

Kanishk Yadav
Developer •  Software Student • AI Enthusiast
📧 Contact: yadavkanishk007@gmail.com
🌐 GitHub: https://github.com/kanishkyadav



 
