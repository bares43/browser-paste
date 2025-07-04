const STORAGE_KEY = 'paste_values';

const RANDOM_ID = 'paste_random_email';

function randomEmail() {
  const user = Math.random().toString(36).substring(2, 10);
  const domain = Math.random().toString(36).substring(2, 10);
  return `${user}@${domain}.com`;
}

function buildMenu(values) {
  chrome.contextMenus.removeAll(() => {
    const rootId = chrome.contextMenus.create({
      title: 'Paste',
      id: 'paste_root',
      contexts: ['editable'],
    });
    chrome.contextMenus.create({
      parentId: rootId,
      title: 'Random email',
      id: RANDOM_ID,
      contexts: ['editable'],
    });
    values.forEach((val, idx) => {
      chrome.contextMenus.create({
        parentId: rootId,
        title: val,
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
  if (info.menuItemId === RANDOM_ID) {
    chrome.tabs.sendMessage(tab.id, { action: 'paste', text: randomEmail() });
    return;
  }
  if (!info.menuItemId.startsWith('paste_')) return;
  const index = parseInt(info.menuItemId.replace('paste_', ''), 10);
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const values = result[STORAGE_KEY] || [];
    const text = values[index];
    if (text) {
      chrome.tabs.sendMessage(tab.id, { action: 'paste', text });
    }
  });
});
