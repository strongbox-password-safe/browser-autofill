import browser from 'webextension-polyfill';
import { Settings } from './Settings';

export class SettingsStore {
  public static async getSettings(): Promise<Settings> {
    const settingsKey = 'settings.v7';

    const ret = await browser.storage.sync.get([settingsKey]);

    if (ret[settingsKey]) {
      
      return ret[settingsKey];
    } else {
      

      return new Settings();
    }
  }

  public static setSettings(settings: Settings) {
    browser.storage.sync.set({ 'settings.v7': settings });
  }
}
