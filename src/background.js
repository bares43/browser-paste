const STORAGE_KEY = 'paste_values';

function randomEmail(domain) {
  const user = Math.random().toString(36).substring(2, 10);
  return `${user}@${domain}`;
}

function randomNumber(from, to) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
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
        val = { type: 'text', value: val };
        values[idx] = val;
      } else if (val.random !== undefined) {
        val = val.random ? { type: 'randomEmail', value: val.value } : { type: 'text', value: val.value };
        values[idx] = val;
      }
      let title = val.value;
      if (val.type === 'randomEmail') {
        title = `${val.value} (random email)`;
      } else if (val.type === 'randomNumber') {
        title = `Random number ${val.from}-${val.to}`;
      }
      chrome.contextMenus.create({
        parentId: rootId,
        title,
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
        val = { type: 'text', value: val };
      } else if (val.random !== undefined) {
        val = val.random ? { type: 'randomEmail', value: val.value } : { type: 'text', value: val.value };
      }
      let text = val.value;
      if (val.type === 'randomEmail') {
        text = randomEmail(val.value);
      } else if (val.type === 'randomNumber') {
        text = String(randomNumber(val.from, val.to));
      }
      chrome.tabs.sendMessage(tab.id, { action: 'paste', text });
    }
  });
});
