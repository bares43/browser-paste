chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'paste') {
    const active = document.activeElement;
    if (!active) return;

    if (active.isContentEditable) {
      // Try inserting text at the caret for contentEditable elements
      const success = document.execCommand('insertText', false, message.text);
      if (!success && typeof active.insertAdjacentText === 'function') {
        active.insertAdjacentText('beforeend', message.text);
      }
      active.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
      const start = active.selectionStart || 0;
      const end = active.selectionEnd || 0;
      const val = active.value || '';
      active.value = val.substring(0, start) + message.text + val.substring(end);
      active.selectionStart = active.selectionEnd = start + message.text.length;
      active.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
});
