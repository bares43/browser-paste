const STORAGE_KEY = 'paste_values';
const list = document.getElementById('valuesList');
const form = document.getElementById('addForm');
const valueInput = document.getElementById('newValue');
const typeSelect = document.getElementById('valueType');
const fromInput = document.getElementById('fromValue');
const toInput = document.getElementById('toValue');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

function upgrade(val) {
  if (typeof val === 'string') {
    return { type: 'text', value: val };
  }
  if (val && typeof val === 'object' && 'random' in val) {
    return val.random ? { type: 'randomEmail', value: val.value } : { type: 'text', value: val.value };
  }
  return val;
}

function label(val) {
  switch (val.type) {
    case 'randomEmail':
      return `${val.value} (random email)`;
    case 'randomNumber':
      return `Random number ${val.from}-${val.to}`;
    default:
      return val.value;
  }
}

function render(values) {
  list.innerHTML = '';
  values.forEach((v, idx) => {
    const val = upgrade(v);
    values[idx] = val;
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = label(val);
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      if (val.type === 'randomNumber') {
        const from = prompt('From', val.from);
        const to = prompt('To', val.to);
        if (from !== null && to !== null) {
          val.from = parseInt(from, 10);
          val.to = parseInt(to, 10);
          values[idx] = val;
          save(values);
        }
      } else {
        const newVal = prompt('Edit value', val.value);
        if (newVal !== null) {
          val.value = newVal;
          values[idx] = val;
          save(values);
        }
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

function toggleInputs() {
  const type = typeSelect.value;
  if (type === 'randomNumber') {
    valueInput.style.display = 'none';
    fromInput.style.display = '';
    toInput.style.display = '';
  } else {
    valueInput.style.display = '';
    fromInput.style.display = 'none';
    toInput.style.display = 'none';
    valueInput.placeholder = type === 'randomEmail' ? 'Domain' : 'Value';
  }
}

typeSelect.addEventListener('change', toggleInputs);

toggleInputs();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = typeSelect.value;
  const value = valueInput.value.trim();
  const from = parseInt(fromInput.value, 10);
  const to = parseInt(toInput.value, 10);
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const values = result[STORAGE_KEY] || [];
    if (type === 'randomNumber') {
      if (!isNaN(from) && !isNaN(to)) {
        values.push({ type, from, to });
      }
    } else if (value) {
      values.push({ type, value });
    }
    save(values);
    valueInput.value = '';
    fromInput.value = '';
    toInput.value = '';
  });
});

chrome.storage.local.get([STORAGE_KEY], (result) => {
  const values = result[STORAGE_KEY] || [];
  render(values);
});

exportBtn.addEventListener('click', () => {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const values = result[STORAGE_KEY] || [];
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paste_values.json';
    a.click();
    URL.revokeObjectURL(url);
  });
});

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const values = JSON.parse(reader.result);
      if (Array.isArray(values)) {
        save(values);
      } else {
        alert('Invalid file');
      }
    } catch (err) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
  importFile.value = '';
});
