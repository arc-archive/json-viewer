import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '../json-viewer.js';

function addToast(text) {
  const toast = document.createElement('paper-toast');
  toast.text = text;
  toast.opened = true;
  document.body.appendChild(toast);
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    addToast('Unable to download JSON data.');
    return;
  }
  try {
    const json = await response.text();
    const node = document.querySelector('json-viewer');
    node.json = json;
    node.raw = json;
  } catch (e) {
    addToast(e.message);
  }
}

document.getElementById('listbox').addEventListener('iron-select', (e) => {
  const file = e.detail.item.dataset.example;
  if (file) {
    getJson(file);
  }
});

document.getElementById('viewer').addEventListener('url-change-action', (e) => {
  addToast(e.detail.url);
});

document.getElementById('manual').addEventListener('url-change-action', (e) => {
  addToast(e.detail.url);
});

document.getElementById('txt').addEventListener('input', (e) => {
  document.getElementById('manual').json = e.target.value;
});

document.getElementById('copyToClipboard').addEventListener('click', () => {
  addToast('Copy to clipboad called');
});

document.getElementById('seeRaw').addEventListener('click', () => {
  addToast('Toggle raw view called');
});

document.getElementById('saveFile').addEventListener('click', () => {
  addToast('Save to file called');
});
