// content_script.js
(() => {
    // 1️⃣  Inject injected.js as a REAL <script> element sourced from the extension.
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("injected.js");   // web-accessible, bypasses CSP
    s.onload = () => s.remove();
    (document.head || document.documentElement).appendChild(s);
  
    // 2️⃣  Listen for messages the injected script posts.
    window.addEventListener("message", (e) => {
      if (e.source !== window) return;                     // only accept from same page
      const d = e.data;
      if (!d || !d.__PAGE_CONSOLE_LOGGER__) return;
  
      chrome.runtime.sendMessage({
        type: "console-log",
        entry: { level: d.level, args: d.args, timestamp: d.timestamp }
      });
    });
  })();
      