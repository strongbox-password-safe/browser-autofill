import nacl, { BoxKeyPair } from 'tweetnacl';
import { NativeMessagingHelper } from '../Messaging/NativeMessagingHelper';
import { AutoFillEncryptedRequest } from './Protocol/AutoFillEncryptedRequest';
import { AutoFillEncryptedResponse } from './Protocol/AutoFillEncryptedResponse';
import { AutoFillMessageType } from './Protocol/AutoFillMessageType';
import { CopyFieldRequest, CopyFieldResponse } from './Protocol/CopyFieldRequest';
import { CreateEntryRequest } from './Protocol/CreateEntryRequest';
import { CreateEntryResponse } from './Protocol/CreateEntryResponse';
import { CredentialsForUrlRequest } from './Protocol/CredentialsForUrlRequest';
import { CredentialsForUrlResponse } from './Protocol/CredentialsForUrlResponse';
import { GeneratePasswordRequest } from './Protocol/GeneratePasswordRequest';
import { GeneratePasswordResponse } from './Protocol/GeneratePasswordResponse';
import { GetGroupsRequest } from './Protocol/GetGroupsRequest';
import { GetGroupsResponse } from './Protocol/GetGroupsResponse';
import { GetNewEntryDefaultsRequest } from './Protocol/GetNewEntryDefaultsRequest';
import { GetNewEntryDefaultsResponse } from './Protocol/GetNewEntryDefaultsResponse';
import { GetStatusResponse } from './Protocol/GetStatusResponse';
import { LockRequest } from './Protocol/LockRequest';
import { LockResponse } from './Protocol/LockResponse';
import { SearchRequest } from './Protocol/SearchRequest';
import { UnlockRequest } from './Protocol/UnlockRequest';
import { UnlockResponse } from './Protocol/UnlockResponse';
import { WellKnownField } from './Protocol/WellKnownField';

export class NativeAppApi {
  private static instance: NativeAppApi;
  private keyPair: BoxKeyPair;
  private latestServerPublicKey: string | undefined;

  private constructor() {
    this.keyPair = nacl.box.keyPair();
  }

  public static getInstance(): NativeAppApi {
    if (!NativeAppApi.instance) {
      NativeAppApi.instance = new NativeAppApi();
    }

    return NativeAppApi.instance;
  }

  public async launchStrongbox(): Promise<boolean> {
    try {
      const response = await NativeMessagingHelper.getInstance().ping({ launch: true });


      return response.success;
    } catch (error) {
      return false;
    }
  }

  public async getStatus(): Promise<GetStatusResponse | null> {
    const startTime = performance.now();

    const request = new AutoFillEncryptedRequest();
    request.messageType = AutoFillMessageType.status;
    request.clientPublicKey = this.byteArrayToBase64(this.keyPair.publicKey);

    const status = await this.sendMessage<GetStatusResponse>(request);


    return status;
  }

  public async createEntry(details: CreateEntryRequest): Promise<CreateEntryResponse | null> {
    const encrypted = await this.buildEncryptedRequest(details, AutoFillMessageType.createEntry);


    return await this.sendMessage<CreateEntryResponse>(encrypted);
  }

  public async getGroups(details: GetGroupsRequest): Promise<GetGroupsResponse | null> {
    const encrypted = await this.buildEncryptedRequest(details, AutoFillMessageType.getGroups);

    return await this.sendMessage<GetGroupsResponse>(encrypted);
  }

  public async getNewEntryDefaults(details: GetNewEntryDefaultsRequest): Promise<GetNewEntryDefaultsResponse | null> {
    const encrypted = await this.buildEncryptedRequest(details, AutoFillMessageType.getNewEntryDefaults);

    return await this.sendMessage<GetNewEntryDefaultsResponse>(encrypted);
  }

  public async generatePassword(details: GeneratePasswordRequest): Promise<GeneratePasswordResponse | null> {
    const encrypted = await this.buildEncryptedRequest(details, AutoFillMessageType.generatePassword);

    return await this.sendMessage<GeneratePasswordResponse>(encrypted);
  }

  public async credentialsForUrl(url: string): Promise<CredentialsForUrlResponse | null> {
    const credRequest = new CredentialsForUrlRequest();
    credRequest.url = url;

    const encrypted = await this.buildEncryptedRequest(credRequest, AutoFillMessageType.getCredentialsForUrl);

    return await this.sendMessage<CredentialsForUrlResponse>(encrypted);
  }

  public async copyField(
    databaseId: string,
    nodeId: string,
    field: WellKnownField,
    explicitTotp = false
  ): Promise<CopyFieldResponse | null> {
    const request = new CopyFieldRequest();
    request.databaseId = databaseId;
    request.nodeId = nodeId;
    request.field = field;
    request.explicitTotp = explicitTotp;

    const encrypted = await this.buildEncryptedRequest(request, AutoFillMessageType.copyField);

    return await this.sendMessage<CopyFieldResponse>(encrypted);
  }

  

  public async unlockDatabase(databaseId: string): Promise<UnlockResponse | null> {
    const request = new UnlockRequest();
    request.databaseId = databaseId;

    const encrypted = await this.buildEncryptedRequest(request, AutoFillMessageType.unlock);
    return await this.sendMessage<UnlockResponse>(encrypted);
  }

  public async lockDatabase(databaseId: string): Promise<LockResponse | null> {
    const request = new LockRequest();
    request.databaseId = databaseId;
    const encrypted = await this.buildEncryptedRequest(request, AutoFillMessageType.lock);
    return await this.sendMessage<LockResponse>(encrypted);
  }

  

  private async sendMessage<Type>(msg: unknown | null): Promise<Type | null> {
    if (msg === null) {
      return null;
    }

    try {
      const response: AutoFillEncryptedResponse = await NativeMessagingHelper.getInstance().ping(msg);
      return this.handleResponse<Type>(response);
    } catch (error) {
      this.latestServerPublicKey = undefined;
      return null;
    }
  }

  private handleResponse<Type>(response: AutoFillEncryptedResponse): Type | null {
    if (response.success) {
      const messageBytes = this.base64ToByteArray(response.message);
      const nonceBytes = this.base64ToByteArray(response.nonce);
      this.latestServerPublicKey = response.serverPublicKey;

      

      const serverPk = this.base64ToByteArray(response.serverPublicKey);

      const decryptedBytes = nacl.box.open(messageBytes, nonceBytes, serverPk, this.keyPair.secretKey);

      if (decryptedBytes == null) {
        this.latestServerPublicKey = undefined; 
        return null;
      }

      const string = new TextDecoder().decode(decryptedBytes);
      const object: Type = JSON.parse(string);

      return object;
    } else {
      this.latestServerPublicKey = undefined; 
      return null;
    }
  }

  private async encryptMessage(message: string, nonce: Uint8Array): Promise<string | null> {
    

    await this.ensureServerPublicKey();

    if (this.latestServerPublicKey) {
      const encoded = new TextEncoder().encode(message);
      const serverPk = this.base64ToByteArray(this.latestServerPublicKey);

      const cipherText = nacl.box(encoded, nonce, serverPk, this.keyPair.secretKey);

      

      return this.byteArrayToBase64(cipherText);
    } else {
      return null;
    }
  }

  private async ensureServerPublicKey() {
    

    if (!this.latestServerPublicKey) {

      await this.getStatus(); 
    }

    
  }

  private async buildEncryptedRequest<Type>(
    innerRequest: Type,
    messageType: AutoFillMessageType
  ): Promise<AutoFillEncryptedRequest | null> {
    
    const json = JSON.stringify(innerRequest);
    const nonce = this.generateNonce();
    const base64Encrypted = await this.encryptMessage(json, nonce);

    if (base64Encrypted === null) {
      return null;
    }

    const request = new AutoFillEncryptedRequest();

    request.messageType = messageType;
    request.clientPublicKey = this.byteArrayToBase64(this.keyPair.publicKey);
    request.nonce = this.byteArrayToBase64(nonce);
    request.message = base64Encrypted;

    

    return request;
  }

  private generateNonce(): Uint8Array {
    return nacl.randomBytes(nacl.box.nonceLength);
  }

  private byteArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  private base64ToByteArray(base64: string): Uint8Array {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }

    return bytes;
  }

  

  public async search(query: string) {

    const searchRequest = new SearchRequest();

    searchRequest.query = query;

    const encrypted = this.buildEncryptedRequest(searchRequest, AutoFillMessageType.search);

  }
}
