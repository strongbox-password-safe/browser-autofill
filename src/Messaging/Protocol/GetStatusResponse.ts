import { DatabaseSummary } from './DatabaseSummary';

export class ServerSettings {
  public supportsCreateNew: boolean;
}

export class GetStatusResponse {
  public serverVersionInfo: string;
  public databases: [DatabaseSummary];
  public serverSettings: ServerSettings;
}
