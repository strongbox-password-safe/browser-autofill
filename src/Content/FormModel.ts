
export default class FormModel {
  element: HTMLFormElement;

  passwordField: HTMLInputElement | null;

  usernameField: HTMLInputElement | null;

  submitButton: HTMLElement | null;

  constructor(element: HTMLFormElement, passwordField: HTMLInputElement | null, usernameField: HTMLInputElement | null, submitButton: HTMLElement | null) {
    this.element = element;
    this.passwordField = passwordField;
    this.usernameField = usernameField;
    this.submitButton = submitButton;
  }

  getUsername(): string | null {
    if (this.usernameField != null) {
      return this.usernameField.value;
    }

    return null;
  }

  getPassword(): string | null {
    if (this.passwordField != null) {
      return this.passwordField.value;
    }

    return null;
  }
}
