document.getElementById("export").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "downloadLogs" });
    window.close();
  });
  