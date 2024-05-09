import { DatabaseSummary } from './DatabaseSummary';

export class ServerSettings {
  public supportsCreateNew: boolean;
  public markdownNotes: boolean;
  public colorizePasswords: boolean;
  public colorBlindPalette: boolean;
}

export class GetStatusResponse {
  public serverVersionInfo: string;
  public databases: [DatabaseSummary];
  public serverSettings: ServerSettings;
}
