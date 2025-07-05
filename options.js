const STORAGE_KEY = 'paste_values';
const list = document.getElementById('valuesList');
const form = document.getElementById('addForm');
const input = document.getElementById('newValue');
const randomCheck = document.getElementById('randomEmail');

function render(values) {
  list.innerHTML = '';
  values.forEach((val, idx) => {
    // handle legacy string entries
    if (typeof val === 'string') {
      val = { value: val, random: false };
      values[idx] = val;
    }
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = val.random ? `${val.value} (random email)` : val.value;
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      const newVal = prompt('Edit value', val.value);
      if (newVal !== null) {
        val.value = newVal;
        values[idx] = val;
        save(values);
      }
    });
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      values.splice(idx, 1);
      save(values);
    });
    li.appendChild(text);
    li.appendChild(edit);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function save(values) {
  chrome.storage.local.set({ [STORAGE_KEY]: values });
  render(values);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  const random = randomCheck.checked;
  if (value) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const values = result[STORAGE_KEY] || [];
      values.push({ value, random });
      save(values);
      input.value = '';
      randomCheck.checked = false;
    });
  }
});

chrome.storage.local.get([STORAGE_KEY], (result) => {
  const values = result[STORAGE_KEY] || [];
  render(values);
});
