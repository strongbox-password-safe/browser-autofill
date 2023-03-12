import { AutoFillMessageType } from './AutoFillMessageType';

export class AutoFillEncryptedRequest {
  public clientPublicKey = 'foo';
  public nonce = '';
  public message = 'message';
  public messageType: AutoFillMessageType = AutoFillMessageType.status;
}
