import browser from 'webextension-polyfill';
import { BackgroundManager } from './BackgroundManager';



browser.runtime.onInstalled.addListener(async (): Promise<void> => {
  await BackgroundManager.getInstance().doSimpleStatusUpdate();
});



browser.windows.onFocusChanged.addListener(windowId => {

  if (windowId != browser.windows.WINDOW_ID_NONE) {
    BackgroundManager.getInstance().refreshCredentialsAndAutoFillIfNecessary(true);
  } else {
    BackgroundManager.getInstance().doSimpleStatusUpdate();
  }
});



browser.tabs.onActivated.addListener(e => {
  BackgroundManager.getInstance().refreshCredentialsAndAutoFillIfNecessary();
});



browser.tabs.onUpdated.addListener(e => {
  BackgroundManager.getInstance().refreshCredentialsAndAutoFillIfNecessary();
});



browser.runtime.onMessage.addListener((message: any, sender: any): Promise<any> => {
  return BackgroundManager.getInstance().onMessage(message, sender);
});



browser.commands.onCommand.addListener(command => {
  if (command == 'autofill-first') {
    BackgroundManager.getInstance().autoFillCurrentTabWithFirstMatch();
  }
});



browser.webNavigation.onCompleted.addListener(tab => {
  if (tab.frameId == 0) {
    
    BackgroundManager.getInstance().refreshCredentialsAndAutoFillIfNecessary(false, true);
  }
});
