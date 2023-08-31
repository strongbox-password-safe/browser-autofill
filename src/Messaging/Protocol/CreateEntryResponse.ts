import { AutoFillCredential } from './AutoFillCredential';

export class CreateEntryResponse {
  uuid: string | null;
  error: string | null;
  credential: AutoFillCredential | null;
}
