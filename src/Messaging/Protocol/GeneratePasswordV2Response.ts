export class GeneratePasswordV2Response {
  password: PasswordAndStrength;
  alternatives: string[];
}

export class PasswordAndStrength {
  password: string;
  strength: PasswordAndStrengthData;
}

export class PasswordAndStrengthData {
  entropy: number;
  category: string;
  summaryString: string;
}
