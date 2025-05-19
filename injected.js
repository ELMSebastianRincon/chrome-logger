// injected.js  (lives at extension root; shipped as a web-accessible resource)
(() => {
    const original = {};
    const methods = ["log", "info", "warn", "error", "debug"];
  
    methods.forEach((m) => {
      original[m] = console[m];
  
      console[m] = (...args) => {
        try {
          window.postMessage(
            {
              __PAGE_CONSOLE_LOGGER__: true,
              level: m,
              args: args.map((a) => {
                try { return JSON.stringify(a); }         // keep objects printable
                catch { return String(a); }
              }),
              timestamp: Date.now()
            },
            "*"
          );
        } catch (_) { /* ignore */ }
  
        original[m](...args);   // still show in the real console
      };
    });
  })();
  