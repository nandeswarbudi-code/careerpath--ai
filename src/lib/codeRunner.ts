const SANDBOX_DOCUMENT = `<!doctype html><html><body><script>
window.addEventListener('message', function (event) {
  if (event.source !== window.parent || !event.data) return;
  var logs = [];
  var originalLog = console.log;
  try {
    console.log = function () {
      if (logs.length >= 50) throw new Error('Too many console.log calls (max 50)');
      logs.push(Array.prototype.slice.call(arguments).map(String).join(' '));
    };
    new Function(event.data.code + '\\n\\n' + event.data.test)();
    console.log = originalLog;
    window.parent.postMessage({ type: 'result', logs: logs }, '*');
  } catch (error) {
    console.log = originalLog;
    window.parent.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) }, '*');
  }
});
<\/script></body></html>`;

export function runCodeInSandbox(code: string, test: string, timeoutMs = 3000): Promise<string[]> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('Code execution is only available in a browser.'));
  }

  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.display = 'none';

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timer);
      frame.remove();
    };
    const onMessage = (event: MessageEvent<{ type?: string; logs?: string[]; message?: string }>) => {
      if (event.source !== frame.contentWindow) return;
      cleanup();
      if (event.data.type === 'result') resolve(event.data.logs ?? []);
      else reject(new Error(event.data.message || 'Code execution failed.'));
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Execution timed out (${timeoutMs / 1000} seconds).`));
    }, timeoutMs);

    window.addEventListener('message', onMessage);
    frame.srcdoc = SANDBOX_DOCUMENT;
    frame.onload = () => frame.contentWindow?.postMessage({ code, test }, '*');
    document.body.appendChild(frame);
  });
}
