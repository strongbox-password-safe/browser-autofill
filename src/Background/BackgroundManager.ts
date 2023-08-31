import { NativeAppApi } from '../Messaging/NativeAppApi';
import { IconManager, IconState } from './IconManager';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { WellKnownField } from '../Messaging/Protocol/WellKnownField';
import browser from 'webextension-polyfill';
import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import { CredentialsForUrlResponse } from '../Messaging/Protocol/CredentialsForUrlResponse';
import { SettingsStore } from '../Settings/SettingsStore';
import { CreateEntryResponse } from '../Messaging/Protocol/CreateEntryResponse';
import { CreateEntryRequest } from '../Messaging/Protocol/CreateEntryRequest';
import { GetGroupsRequest } from '../Messaging/Protocol/GetGroupsRequest';
import { GetGroupsResponse } from '../Messaging/Protocol/GetGroupsResponse';
import { GeneratePasswordRequest } from '../Messaging/Protocol/GeneratePasswordRequest';
import { GeneratePasswordResponse } from '../Messaging/Protocol/GeneratePasswordResponse';
import { GetNewEntryDefaultsRequest } from '../Messaging/Protocol/GetNewEntryDefaultsRequest';
import { GetNewEntryDefaultsResponse } from '../Messaging/Protocol/GetNewEntryDefaultsResponse';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';
import { DatabaseSummary } from '../Messaging/Protocol/DatabaseSummary';
import { LastKnownDatabasesItem } from '../Settings/Settings';
import { CopyFieldResponse } from '../Messaging/Protocol/CopyFieldRequest';

export class BackgroundManager {
  private static instance: BackgroundManager;

  private constructor() {
    
  }

  public static getInstance(): BackgroundManager {
    if (!BackgroundManager.instance) {
      BackgroundManager.instance = new BackgroundManager();
    }

    return BackgroundManager.instance;
  }

  

  

  public async doSimpleStatusUpdate(): Promise<void> {

    await this.getStatus();
  }

  public async updatePopupIconBasedOnStatus(status: GetStatusResponse | null) {
    if (status === null) {
      await IconManager.setIcon(IconState.disconnected);
    } else {
      const unlockedDatabases = status.databases.filter(database => {
        return !database.locked;
      });

      if (unlockedDatabases.length == 0) {
        await IconManager.setIcon(IconState.allDatabasesLocked);
      } else {
        await IconManager.setIcon(IconState.good);
      }
    }
  }

  

  static async getCurrentTab(): Promise<browser.Tabs.Tab | undefined> {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    return tabs[0];
  }

  async getCurrentUrl(): Promise<string | undefined> {
    const tab = await BackgroundManager.getCurrentTab();
    if (!tab) {
      return;
    }

    return tab ? tab.url : undefined;
  }

  public async refreshCredentialsAndAutoFillIfNecessary(force = false, shouldAttemptAutoFill = false): Promise<void> {
    try {
      const tab = await BackgroundManager.getCurrentTab();
      const url = tab?.url;

      if (!url || !tab) {
        return;
      }


      if (
        force ||
        
        shouldAttemptAutoFill
      ) {
        


        const credentials = await this.checkForCredentialsUrl(url);

        

        const tabID = tab.id;
        if (shouldAttemptAutoFill && tabID && credentials && credentials.length > 0) {

          const settings = await SettingsStore.getSettings();

          if (
            (tabID && settings.autoFillImmediatelyIfOnlyASingleMatch && credentials.length == 1) ||
            settings.autoFillImmediatelyWithFirstMatch
          ) {
            setTimeout(() => {
              this.doOnLoadFill(tabID, credentials[0]);
            }, 100);
          }
        }
      }
    } catch (error) {
      
      
      
    }
  }

  public doOnLoadFill(tabID: number, credential: AutoFillCredential) {
    this.fillWithCredential(tabID, credential, true);
  }

  public async autoFillCurrentTabWithFirstMatch(): Promise<void> {

    const tab = await BackgroundManager.getCurrentTab();

    if (!tab || !tab.id) {
      return;
    }

    const url = tab.url;

    if (url) {
      const results = await this.checkForCredentialsUrl(url);

      if (results != null) {
        if (results.length > 0) {
          await this.fillWithCredential(tab.id, results[0]);
        } else {
        }
      } else {
        await IconManager.setIcon(IconState.disconnected);
      }
    } else {
    }
  }

  public async fillWithCredential(tabId: number, credential: AutoFillCredential, onLoad = false) {

    await browser.tabs.sendMessage(tabId, { credential: credential, onLoadFill: onLoad });
  }

  

  private async updateBadgeAndIconBasedOnCredentialsResponse(
    response: CredentialsForUrlResponse,
    endTime: number,
    startTime: number
  ) {
    const unlockedDatabaseCount = response.unlockedDatabaseCount;
    const resultCount = response.results.length;

    
    
    
    
    
    

    if (unlockedDatabaseCount == 0) {
      await IconManager.setIcon(IconState.allDatabasesLocked);
    } else {
      if (response.results.length > 0) {
        const settings = await SettingsStore.getSettings();

        if (settings.showMatchCountOnPopupBadge) {
          await IconManager.setIcon(IconState.good, response.results.length.toString());
        } else {
          await IconManager.setIcon(IconState.good);
        }
      } else {
        await IconManager.setIcon(IconState.good);
      }
    }
  }

  private async copyTotpCodeIfConfiguredAfterFill(credential: AutoFillCredential): Promise<void> {
    if (credential.totp != '') {
      await NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.totp);
    }
  }

  private async createNewEntry(details: CreateEntryRequest): Promise<CreateEntryResponse | null> {
    

    const response = await NativeAppApi.getInstance().createEntry(details);

    

    return response;
  }

  private async getGroups(details: GetGroupsRequest): Promise<GetGroupsResponse | null> {
    

    const response = await NativeAppApi.getInstance().getGroups(details);

    

    return response;
  }

  private async unlockDatabase(uuid: string): Promise<UnlockResponse | null> {

    const status = await this.getStatus();

    if (status == null) {
      const response = await this.launchStrongbox();

      if (!response) {
        return null;
      } else {
        
        await new Promise(f => setTimeout(f, 500));
      }
    }


    const response2 = await NativeAppApi.getInstance().unlockDatabase(uuid);


    

    return response2;
  }

  private async getNewEntryDefaults(details: GetNewEntryDefaultsRequest): Promise<GetNewEntryDefaultsResponse | null> {
    

    const response = await NativeAppApi.getInstance().getNewEntryDefaults(details);

    

    return response;
  }

  private async generatePassword(details: GeneratePasswordRequest): Promise<GeneratePasswordResponse | null> {
    

    const response = await NativeAppApi.getInstance().generatePassword(details);

    

    return response;
  }

  private async getStatus(): Promise<GetStatusResponse | null> {
    

    await IconManager.setIcon(IconState.disconnected); 

    const status = await NativeAppApi.getInstance().getStatus();
    

    if (status) {
      const databases = status.databases;

      this.updateLastKnownDatabases(databases);
    }

    await this.updatePopupIconBasedOnStatus(status);

    

    return status;
  }

  async updateLastKnownDatabases(databases: DatabaseSummary[]) {
    const stored = await SettingsStore.getSettings();
    const mapped = databases
      .filter(database => database.autoFillEnabled)
      .map(database => new LastKnownDatabasesItem(database.nickName, database.uuid));
    stored.lastKnownDatabases = mapped;

    await SettingsStore.setSettings(stored);
  }

  private async launchStrongbox(): Promise<boolean> {

    const response = await NativeAppApi.getInstance().launchStrongbox();


    return response;
  }

  private async copyField(
    credential: AutoFillCredential,
    field: WellKnownField,
    explicitTotp = false
  ): Promise<CopyFieldResponse | null> {

    const response = await NativeAppApi.getInstance().copyField(
      credential.databaseId,
      credential.uuid,
      field,
      explicitTotp
    );


    return response;
  }

  public async onMessage(message: any, sender: any): Promise<any> {
    
    

    if (message.type === 'popup-request') {
      if (message.value == 'refresh-popup-icon') {
        this.updatePopupIconBasedOnStatus(message.status);
      }
    } else if (message.type === 'get-status') {
      const response = await this.getStatus();


      return response;
    } else if (message.type === 'launch-strongbox') {
      const response = await this.launchStrongbox();


      return response;
    } else if (message.type === 'unlock-database') {
      return await this.unlockDatabase(message.details.uuid);
    } else if (message.type === 'get-groups') {
      const details = message.details;

      

      const response = await this.getGroups(details);

      

      return response;
    } else if (message.type === 'get-new-entry-defaults') {
      const details = message.details;

      

      const response = await this.getNewEntryDefaults(details);

      

      return response;
    } else if (message.type === 'generate-password') {
      const details = message.details;

      

      const response = await this.generatePassword(details);

      

      return response;
    } else if (message.type === 'create-new-entry') {
      const details = message.details;

      

      const response = await this.createNewEntry(details);

      

      return response;
    } else if (message.type === 'copy-totp-after-fill') {
      const credential = message.details;

      

      const response = await this.copyTotpCodeIfConfiguredAfterFill(credential);

      

      return response;
    } else if (message.type === 'copy-username') {
      const credential = message.details;

      

      const response = await this.copyField(credential, WellKnownField.username);

      

      return response;
    } else if (message.type === 'copy-password') {
      const credential = message.details;

      

      const response = await this.copyField(credential, WellKnownField.password);

      

      return response;
    } else if (message.type === 'copy-totp') {
      const credential = message.details;

      

      const response = await this.copyField(credential, WellKnownField.totp, true);

      

      return response;
    } else if (message.type === 'get-tab-for-this-content-script') {
      

      return sender.tab as browser.Tabs.Tab;
    } else if (message.type === 'get-credentials') {
      

      const tab = sender.tab as browser.Tabs.Tab;
      const url = tab?.url;

      if (url) {
        const credentials = await this.checkForCredentialsUrl(url);

        

        return credentials;
      } else {
        return [];
      }
    }

    return Promise.reject();
  }

  private async checkForCredentialsUrl(url: string): Promise<AutoFillCredential[] | null> {
    const startTime = performance.now();

    const response = await NativeAppApi.getInstance().credentialsForUrl(url);

    if (response != null) {
      const endTime = performance.now();

      await this.updateBadgeAndIconBasedOnCredentialsResponse(response, endTime, startTime);

      return response.results;
    } else {
      await IconManager.setIcon(IconState.disconnected);
    }

    return null;
  }
}
