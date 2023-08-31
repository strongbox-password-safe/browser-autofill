import browser from 'webextension-polyfill';
import { AutoFillEncryptedResponse } from './Protocol/AutoFillEncryptedResponse';

export class NativeMessagingHelper {
  private static instance: NativeMessagingHelper;

  private constructor() {
    
  }

  public static getInstance(): NativeMessagingHelper {
    if (!NativeMessagingHelper.instance) {
      NativeMessagingHelper.instance = new NativeMessagingHelper();
    }

    return NativeMessagingHelper.instance;
  }

  private static AppId = 'com.markmcguill.strongbox';

  public async ping(message: unknown): Promise<AutoFillEncryptedResponse> {
    return browser.runtime.sendNativeMessage(NativeMessagingHelper.AppId, message);
  }
}
