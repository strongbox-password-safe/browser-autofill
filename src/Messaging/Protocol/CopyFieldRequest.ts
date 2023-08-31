import { WellKnownField } from './WellKnownField';

export class CopyFieldRequest {
  databaseId = '';
  nodeId = '';
  field: WellKnownField;
  explicitTotp = false;
}

export class CopyFieldResponse {
  success: boolean;
}
