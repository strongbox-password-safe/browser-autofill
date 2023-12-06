import browser from 'webextension-polyfill';
import './content.css';
import { ContentScriptManager } from './ContentScriptManager';
import { Utils } from '../Utils';

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
  } else if (message.restoreFocus) {
    contentScriptManager.iframeManager.restoreFocus();
  } else if (message.openCreateNewDialog) {
    if (Utils.isParentDocument()) {
      contentScriptManager.showCreateNewDialog();
    }
  } else if (message.openInlineMenu) {
    contentScriptManager.forceShowInlineMenuOnCurrentInput();
  }
});
