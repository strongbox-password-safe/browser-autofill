import * as OTPAuth from 'otpauth';

export class AutoFillCredential {
  databaseId = '';
  uuid = '';
  title = '';
  username = '';
  password = '';
  url = '';
  totp = '';
  icon = '';
  customFields: { [key: string]: [value: string] } = {};
  databaseName = 'Foo';
  tags: string[] = [];
  favourite = false;
  notes: string;
  modified: string;

  static getCurrentTotpCode(credential: AutoFillCredential, formatted = true): string {
    if (credential.totp.length > 0) {
      try {
        const parsedTotp = OTPAuth.URI.parse(credential.totp);
        const code = parsedTotp.generate();

        if (code.length > 0 && formatted) {
          const middle = Math.floor(code.length / 2);
          if (middle > 0) {
            return code.substring(0, middle) + '-' + code.substring(middle);
          } else {
            return code;
          }
        } else {
          return code;
        }
      } catch (error) {
      }
    }

    return '';
  }
}
