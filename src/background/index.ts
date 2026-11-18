// Service worker (MV3). Minimal message router + storage helpers.
chrome.runtime.onInstalled.addListener(() => {
  console.log('[YT Notes] installed');
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'ping') {
    sendResponse({ ok: true, ts: Date.now() });
    return true;
  }
  return false;
});
