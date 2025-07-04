chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'paste') {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      const start = active.selectionStart || 0;
      const end = active.selectionEnd || 0;
      const val = active.value || '';
      active.value = val.substring(0, start) + message.text + val.substring(end);
      active.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
});
