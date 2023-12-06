import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import { AutoFiller } from './AutoFiller';
import browser from 'webextension-polyfill';
import { CreateEntryRequest } from '../Messaging/Protocol/CreateEntryRequest';
import { CreateEntryResponse } from '../Messaging/Protocol/CreateEntryResponse';
import ReactDOM from 'react-dom/client';
import { Utils } from '../Utils';
import { GetGroupsResponse } from '../Messaging/Protocol/GetGroupsResponse';
import { GetGroupsRequest } from '../Messaging/Protocol/GetGroupsRequest';
import { GetNewEntryDefaultsRequest } from '../Messaging/Protocol/GetNewEntryDefaultsRequest';
import { GetNewEntryDefaultsResponse } from '../Messaging/Protocol/GetNewEntryDefaultsResponse';
import { GeneratePasswordRequest } from '../Messaging/Protocol/GeneratePasswordRequest';
import { GeneratePasswordResponse } from '../Messaging/Protocol/GeneratePasswordResponse';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';
import { PageAnalyser } from './PageAnalyser';
import { SettingsStore } from '../Settings/SettingsStore';
import { LastKnownDatabasesItem, Settings } from '../Settings/Settings';
import { IframeComponentTypes, IframeManager } from './Iframe/iframeManager';
import { GeneratePasswordV2Response } from '../Messaging/Protocol/GeneratePasswordV2Response';
import { GetPasswordAndStrengthRequest } from '../Messaging/Protocol/GetPasswordAndStrengthRequest';
import { GetPasswordAndStrengthResponse } from '../Messaging/Protocol/GetPasswordAndStrengthResponse';
import { SearchResponse } from '../Messaging/Protocol/SearchResponse';
import { GetNewEntryDefaultsResponseV2 } from '../Messaging/Protocol/GetNewEntryDefaultsResponseV2';

export interface MainPageInformation {
  title: string;
  url: string;
  favIconBase64: string | null;
  favIconUrl: string | null;
}

export class ContentScriptManager {
  pageLoadFillDone = false;
  reactRoot: ReactDOM.Root;
  reactRootPopupMenu: ReactDOM.Root | null;
  currentInlineMenuInputElement: HTMLElement | null;
  iframeManager: IframeManager;
  hideInlineMenusForAWhile = false;

  constructor() {
    this.iframeManager = new IframeManager(this);
  }

  onDOMLoaded() {

    this.addFocusListener();
    

    
    
    

    
    
    
    

    
    
    
    
    

    this.autoShowInlineMenuIfFocusedInputRecognized();
  }

  async getStatus(): Promise<GetStatusResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-status' });

    

    return ret;
  }

  async getCredentials(skip: number, take: number): Promise<AutoFillCredential[] | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-credentials', details: { skip, take } });

    

    return ret;
  }

  async getIcon(databaseId: string, nodeId: string) {
    const ret = await browser.runtime.sendMessage({ type: 'get-icon', details: { databaseId, nodeId } });

    

    return ret;
  }

  async getSearchCredentials(query: string, skip: number, take: number): Promise<SearchResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-search', details: { query, skip, take } });

    

    return ret;
  }

  async getGroups(request: GetGroupsRequest): Promise<GetGroupsResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-groups', details: request });

    

    return ret;
  }

  async launchStrongbox() {
    const ret = await browser.runtime.sendMessage({ type: 'launch-strongbox' });

    

    return ret;
  }

  async onCopyUsername(credential: AutoFillCredential) {
    await browser.runtime.sendMessage({ type: 'copy-username', details: credential });
  }

  async onCopyPassword(credential: AutoFillCredential) {
    await browser.runtime.sendMessage({ type: 'copy-password', details: credential });
  }

  async onCopyTotp(credential: AutoFillCredential) {
    await browser.runtime.sendMessage({ type: 'copy-totp', details: credential });
  }

  async onCopy(value: string) {
    await browser.runtime.sendMessage({ type: 'copy-string', details: value });
  }

  async onRedirectUrl(url: string) {
    window.open(url, '_blank');
  }

  async unlockDatabase(uuid: string): Promise<UnlockResponse | null> {
    const ret = await browser.runtime.sendMessage({
      type: 'unlock-database',
      details: {
        uuid: uuid,
      },
    });

    

    return ret;
  }

  async getNewEntryDefaults(request: GetNewEntryDefaultsRequest): Promise<GetNewEntryDefaultsResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-new-entry-defaults', details: request });

    

    return ret;
  }

  async getNewEntryDefaultsV2(request: GetNewEntryDefaultsRequest): Promise<GetNewEntryDefaultsResponseV2 | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-new-entry-defaults-v2', details: request });

    

    return ret;
  }

  async generatePassword(request: GeneratePasswordRequest): Promise<GeneratePasswordResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'generate-password', details: request });

    

    return ret;
  }

  async generatePasswordV2(): Promise<GeneratePasswordV2Response | null> {
    const ret = await browser.runtime.sendMessage({ type: 'generate-password-v2' });

    

    return ret;
  }

  async getPasswordStrength(request: GetPasswordAndStrengthRequest): Promise<GetPasswordAndStrengthResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-password-strength', details: request });

    

    return ret;
  }

  async createNewEntry(details: CreateEntryRequest): Promise<CreateEntryResponse | null> {
    const ret = await browser.runtime.sendMessage({ type: 'create-new-entry', details: details });

    

    return ret;
  }

  async copyTotpCodeIfConfiguredAfterFill(details: AutoFillCredential): Promise<void> {
    const ret = await browser.runtime.sendMessage({ type: 'copy-totp-after-fill', details: details });

    

    return ret;
  }

  async getCurrentTab(): Promise<browser.Tabs.Tab | null> {
    const ret = await browser.runtime.sendMessage({ type: 'get-tab-for-this-content-script' });

    

    return ret;
  }

  async onCreatedNewItem(credential: AutoFillCredential, message: string) {
    await this.onFillWithCredential(credential);

    setTimeout(() => {
      this.showNotificationToast(message);
    }, 300);
  }

  showNotificationToast(message: string) {
    this.iframeManager.initialize(IframeComponentTypes.NotificationToast, document.body as HTMLInputElement, false, message);
  }

  showCreateNewDialog() {
    this.iframeManager.initialize(IframeComponentTypes.CreateNewEntryDialog, document.body as HTMLInputElement, false);
  }

  async getFavIconBase64Data(url: string): Promise<string | null> {
    

    const testImg = document.createElement('img') as HTMLImageElement;
    if (testImg === null) {
      return null;
    }

    testImg.src = url;

    try {
      await testImg.decode();
    } catch (error) {
      return null;
    }

    const imageData = Utils.getImageElementBase64PNGData(testImg);

    if (imageData && imageData?.length > 20 * 1024) {
      
      
      return null;
    }

    
    
    

    const chromeDefaultFavIconHash = -1499456902;
    if (imageData == null || testImg.naturalHeight === 0) {
      
      
      return null;
    } else if (Utils.quickHashString(imageData) === chromeDefaultFavIconHash) {
      return null;
    }

    return imageData;
  }

  async getFavIconUrl(): Promise<string | null> {
    if (Utils.isFirefox()) {
      const thisTab = await this.getCurrentTab();
      return thisTab?.favIconUrl ?? null;
    } else {
      const url = new URL(browser.runtime.getURL('/_favicon/'));
      url.searchParams.set('pageUrl', document.location.href);
      url.searchParams.set('size', '128');
      return url.toString();
    }
  }

  handleSaveNewEntry(details: CreateEntryRequest) {
    return this.createNewEntry(details);
  }

  

  async getLastKnownAutoFillDatabases(): Promise<LastKnownDatabasesItem[]> {
    const stored = await SettingsStore.getSettings();
    return stored.lastKnownDatabases;
  }

  async shouldAutoShowInlineMenuOnFocus(): Promise<boolean> {
    const settings = await SettingsStore.getSettings();

    if (!Utils.isMacintosh()) {
      return false;
    }

    if (!settings.showInlineIconAndPopupMenu || Settings.isUrlIsInDoNotShowInlineMenusList(settings, document.location.href)) {
      return false;
    }

    if (!settings.showInlineIconAndPopupMenu || Settings.isUrlPageIsInDoNotShowInlineMenusList(settings, document.location.href)) {
      return false;
    }

    if (!settings.showInlineIconAndPopupMenu || this.hideInlineMenusForAWhile) {
      return false;
    }

    return true;
  }

  

  listen = false; 
  focusOrBlurListener: EventListener = event => this.onFocusChanged(event);
  addFocusListener() {
    
    this.listen = true;
    document.addEventListener('focus', this.focusOrBlurListener, true);
    document.addEventListener('blur', this.focusOrBlurListener, true);
  }

  removeFocusListener() {
    
    this.listen = false;
    document.removeEventListener('focus', this.focusOrBlurListener, true);
    document.removeEventListener('blur', this.focusOrBlurListener, true);
  }

  timeout: NodeJS.Timeout | null;
  clearBlurTimeout() {
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  async onFocusChanged(event: Event) {
    this.currentInlineMenuInputElement = null;

    if (!this.listen) {
      
      return;
    }

    

    

    this.clearBlurTimeout();

    if (event.type === 'blur') {
      
      this.timeout = setTimeout(() => {
        this.autoShowInlineMenuIfFocusedInputRecognized();
        this.timeout = null;
      }, 200);
    } else {
      this.autoShowInlineMenuIfFocusedInputRecognized();
    }
  }

  

  async autoShowInlineMenuIfFocusedInputRecognized() {
    if (document.activeElement && document.activeElement instanceof HTMLInputElement) {
      const focusedElement = document.activeElement as HTMLInputElement;

      const shouldRun = await this.shouldAutoShowInlineMenuOnFocus();
      if (!shouldRun) {
        return;
      }

      const usernames = await PageAnalyser.getAllUsernameInputs();
      const isRecognizedUsernameField = usernames.some(input => input == focusedElement);
      const passwords = await PageAnalyser.getAllPasswordInputs();
      const isRecognizedPasswordField = passwords.some(input => input == focusedElement);

      if (isRecognizedUsernameField || isRecognizedPasswordField) {

        this.currentInlineMenuInputElement = focusedElement;

        this.showInlineMenuOnInputElement(focusedElement, isRecognizedPasswordField);
      } else {
      }
    } else {
    }
  }

  async forceShowInlineMenuOnCurrentInput() {
    if (!Utils.isMacintosh()) {
      return false;
    }

    if (document.activeElement && document.activeElement instanceof HTMLInputElement) {
      const focusedElement = document.activeElement as HTMLInputElement;

      this.currentInlineMenuInputElement = focusedElement;

      const passwords = await PageAnalyser.getAllPasswordInputs();
      const isLikelyPasswordField = passwords.some(input => input == focusedElement) || focusedElement.type === 'password';

      await this.showInlineMenuOnInputElement(focusedElement, isLikelyPasswordField);
    } else {
    }
  }

  async showInlineMenuOnInputElement(fieldElement: HTMLInputElement, isPasswordField: boolean) {
    
    const status = await this.getStatus();

    if (status == null) {
    }

    this.iframeManager.initialize(IframeComponentTypes.InlineMiniFieldMenu, fieldElement, isPasswordField);
  }

  async getUnlockableDatabases(status: GetStatusResponse | null): Promise<LastKnownDatabasesItem[]> {
    if (status) {
      return status.databases.filter(database => database.autoFillEnabled && database.locked).map(database => new LastKnownDatabasesItem(database.nickName, database.uuid));
    } else {
      const stored = await SettingsStore.getSettings();
      return stored.lastKnownDatabases;
    }
  }

  async onFillWithCredential(credential: AutoFillCredential, inlineFieldInitiator: HTMLInputElement | null = null, inlineFieldInitiatorIsPassword = false) {
    await this.autoFillWithCredential(credential, false, inlineFieldInitiator, inlineFieldInitiatorIsPassword);
  }

  async onFillSingleField(text: string, inlineFieldInitiator: HTMLInputElement) {
    await this.autoFillSingleField(text, inlineFieldInitiator);
  }

  async autoFillWithCredential(
    credential: AutoFillCredential,
    isPageLoadFill = false,
    inlineFieldInitiator: HTMLInputElement | null = null,
    inlineFieldInitiatorIsPassword = false,
    fillMultiple = false
  ): Promise<boolean> {

    if (isPageLoadFill) {

      const settings = await SettingsStore.getSettings();
      if (Settings.isUrlInDoNotFillList(settings, document.location.href)) {
        return false;
      }

      if (this.pageLoadFillDone) {
        return false;
      }

      this.pageLoadFillDone = true;
    }

    

    this.removeFocusListener();

    const autoFiller = new AutoFiller();
    const filled = await autoFiller.doIt(credential, inlineFieldInitiator, inlineFieldInitiatorIsPassword, fillMultiple);

    setTimeout(() => {
      this.addFocusListener();
    }, 500);

    if (filled) {
      this.iframeManager.remove();
      this.copyTotpCodeIfConfiguredAfterFill(credential);
    }

    return filled;
  }

  async autoFillSingleField(text: string, inlineFieldInitiator: HTMLInputElement): Promise<void> {

    

    this.removeFocusListener();

    const autoFiller = new AutoFiller();

    await autoFiller.doItSingleField(text, inlineFieldInitiator);

    setTimeout(() => {
      this.addFocusListener();
    }, 500);

    this.iframeManager.remove();
  }
}
