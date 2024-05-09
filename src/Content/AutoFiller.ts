import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { PageAnalyser } from './PageAnalyser';

export class AutoFiller {
  async doIt(credential: AutoFillCredential, inlineFieldInitiator: HTMLInputElement | null = null, inlineFieldInitiatorIsPassword = false, fillMultiple = false): Promise<boolean> {
    

    

    const usernames = await PageAnalyser.getAllUsernameInputs();
    const passwords = await PageAnalyser.getAllPasswordInputs();

    let filledSomething = false;

    

    if (inlineFieldInitiator !== null && !inlineFieldInitiatorIsPassword) {
      this.fillFieldAndAnimate(inlineFieldInitiator, credential.username);
      filledSomething = true;
    } else {

      if (usernames.length === 0) {
      }

      for (const usernameField of usernames) {
        this.fillFieldAndAnimate(usernameField, credential.username);
        filledSomething = true;

        if (!fillMultiple) {
          break;
        }
      }
    }

    

    if (inlineFieldInitiator !== null && inlineFieldInitiatorIsPassword) {
      this.fillFieldAndAnimate(inlineFieldInitiator, credential.password);
      filledSomething = true;
    } else {

      if (passwords.length === 0) {
      }

      for (const passwordField of passwords) {
        this.fillFieldAndAnimate(passwordField, credential.password);
        filledSomething = true;

        if (!fillMultiple) {
          break;
        }
      }
    }

    return filledSomething;
  }

  async doItSingleField(text: string, inlineFieldInitiator: HTMLInputElement, appendValue = false): Promise<void> {
    this.fillFieldAndAnimate(inlineFieldInitiator, text, appendValue);
  }

  private fillFieldAndAnimate(field: HTMLInputElement, value: string, appendValue = false) {
    this.fillField(field, value, appendValue);

    field.classList.add('com-phoebecode-strongbox-autofill-animated');

    setTimeout(function () {
      if (field) {
        field.classList.remove('com-phoebecode-strongbox-autofill-animated');
      }
    }, 500);
  }

  private getKeyboardEvent(eventName: string) {
    return new window.KeyboardEvent(eventName, {
      bubbles: true,
      cancelable: false,
    });
  }

  private fillField(field: HTMLInputElement, value: string, appendValue = false) {
    const originalValue = field.value;

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    clickEvent.stopPropagation();

    field.dispatchEvent(clickEvent);
    field.focus();

    field.dispatchEvent(this.getKeyboardEvent('keydown'));
    field.dispatchEvent(this.getKeyboardEvent('keypress'));
    field.dispatchEvent(this.getKeyboardEvent('keyup'));

    if (field.value !== originalValue) {
      field.value = originalValue;
    }

    field.value = appendValue ? field.value + value : value;
    value = appendValue ? field.value : value;

    field.dispatchEvent(this.getKeyboardEvent('keydown'));
    field.dispatchEvent(this.getKeyboardEvent('keypress'));
    field.dispatchEvent(this.getKeyboardEvent('keyup'));

    const onInputEvent = field.ownerDocument.createEvent('HTMLEvents');
    onInputEvent.initEvent('input', true, true);
    field.dispatchEvent(onInputEvent);

    const onChangeEvent = field.ownerDocument.createEvent('HTMLEvents');
    onChangeEvent.initEvent('change', true, true);
    field.dispatchEvent(onChangeEvent);

    field.blur();

    if (field.value !== value) {
      field.value = value;
    }
  }
}
