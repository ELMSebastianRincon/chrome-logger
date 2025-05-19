// background.js -- Manifest V3 service-worker

// Keep everything in one listener to avoid accidental early returns
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // 1️⃣  Receive logs from content_script.js
    if (msg.type === "console-log" && sender.tab) {
        const tabId = sender.tab.id;
        // Persist per tab in chrome.storage.session so it survives worker restarts
        chrome.storage.session.get([String(tabId)], (data) => {
            const record = data[String(tabId)] || { url: sender.tab.url, logs: [] };
            record.logs.push(msg.entry);
            chrome.storage.session.set({ [tabId]: record });
        });
        return;                        // done
    }

    // 2️⃣  "Export All Logs" from the popup
    // … inside the chrome.runtime.onMessage listener …
    if (msg.type === "downloadLogs") {
        chrome.storage.session.get(null, (allTabs) => {
            const json = JSON.stringify(allTabs, null, 2);

            // Build a data-URL: data:application/json,<url-encoded-text>
            const dataUrl =
                "data:application/json;charset=utf-8," + encodeURIComponent(json);

            chrome.downloads.download(
                {
                    url: dataUrl,
                    filename: "console-logs.json",
                    saveAs: true   // still honours the user’s “Ask where to save” setting
                },
                (downloadId) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Download failed:",
                            chrome.runtime.lastError.message
                        );
                    }
                }
            );
        });
        return;
    }

});

// 3️⃣  Reset a tab’s log on top-level navigation
chrome.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
    if (frameId !== 0) return;       // ignore iframes
    chrome.storage.session.set({ [tabId]: { url, logs: [] } });
});
