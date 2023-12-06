import browser from 'webextension-polyfill';
import { LastKnownDatabasesItem, Settings } from './Settings';
import { Utils } from '../Utils';

const settingsSerializableObject: {
  lng: string;
  lastSelectedNewEntryGroupUuidForDatabase: string;
  autoFillImmediatelyIfOnlyASingleMatch: boolean;
  autoFillImmediatelyWithFirstMatch: boolean;
  showMatchCountOnPopupBadge: boolean;
  showInlineIconAndPopupMenu: boolean;
  lastKnownDatabases: LastKnownDatabasesItem[];
  doNotShowInlineMenusOnDomains: string[];
  doNotShowInlineMenusOnPages: string[];
  doNotFillOnDomains: string[];
  lightOrDarkAppearance: number;
  fontSize: number;
  spacing: number;
  hideCredentialDetailsOnPopup: boolean;
  hideCredentialDetailsOnInlineMenu: boolean;
} = {
  lng: String(),
  lastSelectedNewEntryGroupUuidForDatabase: String(),
  autoFillImmediatelyIfOnlyASingleMatch: false,
  autoFillImmediatelyWithFirstMatch: false,
  showMatchCountOnPopupBadge: false,
  showInlineIconAndPopupMenu: false,
  lastKnownDatabases: [],
  doNotShowInlineMenusOnDomains: [],
  doNotShowInlineMenusOnPages: [],
  doNotFillOnDomains: [],
  lightOrDarkAppearance: 0,
  fontSize: 0,
  spacing: 0,
  hideCredentialDetailsOnPopup: false,
  hideCredentialDetailsOnInlineMenu: false,
};

const settingsKey = 'settings.v8'; 

export class SettingsStore {
  private static serialize(settings: Settings): string {
    
    const excludedProperties = ['lastSelectedNewEntryGroupUuidForDatabase'];
    const serializableObject = Utils.mapProperties(settings, settingsSerializableObject, excludedProperties);

    
    serializableObject.lastSelectedNewEntryGroupUuidForDatabase = JSON.stringify(
      Array.from(settings.lastSelectedNewEntryGroupUuidForDatabase.entries())
    );

    
    return JSON.stringify(settingsSerializableObject);
  }

  private static deserialize(value: string): Settings {
    
    const settingsSerializableObject = JSON.parse(value);

    
    const excludedProperties = ['lastSelectedNewEntryGroupUuidForDatabase'];
    const settings = Utils.mapProperties(settingsSerializableObject, new Settings(), excludedProperties);

    
    const storedMapArray = JSON.parse(settingsSerializableObject.lastSelectedNewEntryGroupUuidForDatabase);
    settings.lastSelectedNewEntryGroupUuidForDatabase = new Map(storedMapArray);

    return settings;
  }

  public static async getSettings(): Promise<Settings> {
    const ret = await browser.storage.sync.get([settingsKey]);

    if (ret[settingsKey]) {
      
      return this.deserialize(ret[settingsKey]);
    } else {
      

      return new Settings();
    }
  }

  public static setSettings(settings: Settings) {

    const newSettings: { [key: string]: any } = {};
    newSettings[settingsKey] = this.serialize(settings);

    browser.storage.sync.set(newSettings);
  }
}
