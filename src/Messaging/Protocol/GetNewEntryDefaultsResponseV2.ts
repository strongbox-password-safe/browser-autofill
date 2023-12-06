import { PasswordAndStrength } from './GeneratePasswordV2Response';

export class GetNewEntryDefaultsResponseV2 {
  error: string | null;
  username: string | null;
  mostPopularUsernames: string[] | null;
  password: PasswordAndStrength | null;
}
