const STORAGE_KEY = 'paste_values';

function randomEmail(domain) {
  const user = Math.random().toString(36).substring(2, 10);
  return `${user}@${domain}`;
}

function buildMenu(values) {
  chrome.contextMenus.removeAll(() => {
    const rootId = chrome.contextMenus.create({
      title: 'Paste',
      id: 'paste_root',
      contexts: ['editable'],
    });
    values.forEach((val, idx) => {
      if (typeof val === 'string') {
        val = { value: val, random: false };
        values[idx] = val;
      }
      chrome.contextMenus.create({
        parentId: rootId,
        title: val.random ? `${val.value} (random email)` : val.value,
        id: `paste_${idx}`,
        contexts: ['editable'],
      });
    });
  });
}

function loadValuesAndBuildMenu() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const values = result[STORAGE_KEY] || [];
    buildMenu(values);
  });
}

chrome.runtime.onInstalled.addListener(loadValuesAndBuildMenu);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    buildMenu(changes[STORAGE_KEY].newValue || []);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.menuItemId.startsWith('paste_')) return;
  const index = parseInt(info.menuItemId.replace('paste_', ''), 10);
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const values = result[STORAGE_KEY] || [];
    let val = values[index];
    if (val) {
      if (typeof val === 'string') {
        val = { value: val, random: false };
      }
      const text = val.random ? randomEmail(val.value) : val.value;
      chrome.tabs.sendMessage(tab.id, { action: 'paste', text });
    }
  });
});
