import browser from 'webextension-polyfill';
import './content.css';
import { ContentScriptManager } from './ContentScriptManager';

const contentScriptManager = new ContentScriptManager();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
  afterDOMLoaded();
}

function afterDOMLoaded() {
  contentScriptManager.onDOMLoaded();
}

browser.runtime.onMessage.addListener((message): void => {
  if (message.credential) {
    contentScriptManager.autoFillWithCredential(message.credential, message.onLoadFill, null, false, true);
  }
});
