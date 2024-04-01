export interface InputVisibilityResult {
  input: HTMLInputElement;
  isVisible: boolean;
}

export class PageAnalyser {
  static async getAllUsernameInputs(): Promise<HTMLInputElement[]> {
    const all = await this.getAllInputs();

    const result = all.filter(input => PageAnalyser.isUsernameInput(input));

    return result;
  }

  static async getAllPasswordInputs(): Promise<HTMLInputElement[]> {
    const all = await this.getAllInputs();

    const result = all.filter(input => PageAnalyser.isPasswordInput(input));

    return result;
  }

  static async getAllInputs(): Promise<HTMLInputElement[]> {
    

    let inputs = Array.from<HTMLInputElement>(document.getElementsByTagName('input'));

    

    const iframes = Array.from<HTMLIFrameElement>(document.getElementsByTagName('iframe'));

    

    for (const iframe of iframes) {
      

      const iframeInputs = iframe.contentDocument?.getElementsByTagName('input');
      if (iframeInputs) {
        const iframeInputsArray = Array.from<HTMLInputElement>(iframeInputs);

        

        inputs.push(...iframeInputsArray);
      }
    }

    

    const minInputWidth = 50;
    inputs = inputs.filter(input => input.offsetWidth > minInputWidth);

    

    const inputPromises = inputs.map(async input => {
      const result: InputVisibilityResult = { input, isVisible: false };

      

      
      
      

      
      
      
      

      if (await this.checkInputIsInViewPortUsingIntersectionObserver(input)) {
        result.isVisible = true;
        return result;
      }

      return result;
    });

    const promisesResults = await Promise.allSettled(inputPromises);

    

    const inputMatches = promisesResults
      .filter(result => result.status === 'fulfilled' && result.value.isVisible)
      .map(result => (result as PromiseFulfilledResult<InputVisibilityResult>).value.input); 

    return inputMatches;
  }

  static isPasswordInput(input: HTMLInputElement) {
    return input.type === 'password'; 
  }

  static isUsernameInput(input: HTMLInputElement) {
    const isInteresting = input.type === 'email' || input.type === 'text' || input.type === 'username' || input.type === 'tel';

    if (!isInteresting) {
      return false;
    }

    const usernameLikeFieldMatches = [
      'user',
      'email',
      'e-mail',
      'customer',
      'login',
      'acct',
      'account',
      'clientnumber',
      
      'benutzer',
      'alias',
      
      'epost', 
    ];

    

    return PageAnalyser.inputFieldMatchesStrings(input, usernameLikeFieldMatches) && !PageAnalyser.isSearchInput(input);
  }

  static isSearchInput(input: HTMLInputElement) {
    if (input.type === 'search') {
      return true;
    }

    

    const searchMatchNames: string[] = ['search'];

    return PageAnalyser.inputFieldMatchesStrings(input, searchMatchNames);
  }

  

  static inputFieldMatchesStrings(input: HTMLInputElement, matchNames: string[]) {
    if (PageAnalyser.stringFuzzyContainsAny(input.id, matchNames)) {
      return true;
    }

    if (PageAnalyser.stringFuzzyContainsAny(input.name, matchNames)) {
      return true;
    }

    if (PageAnalyser.stringFuzzyContainsAny(input.autocomplete, matchNames)) {
      return true;
    }

    if (PageAnalyser.stringFuzzyContainsAny(input.placeholder, matchNames)) {
      return true;
    }

    if (PageAnalyser.stringFuzzyContainsAny(input.title, matchNames)) {
      return true;
    }

    if (input.ariaLabel && PageAnalyser.stringFuzzyContainsAny(input.ariaLabel, matchNames)) {
      return true;
    }

    

    const allLabels = this.getLabelsForInput(input);

    const labelMatch = allLabels.some(label => PageAnalyser.stringFuzzyContainsAny(label, matchNames));

    if (labelMatch) {
      return true;
    }

    

    for (let i = 0, atts = input.attributes, n = atts.length; i < n; i++) {
      const att = atts[i];

      if (att.nodeName.toLowerCase() == 'style') {
        
        continue;
      }

      if (att.nodeValue && PageAnalyser.stringFuzzyContainsAny(att.nodeValue, matchNames)) {
        

        return true;
      }
    }

    return false;
  }

  static getLabelsForInput(input: HTMLInputElement): string[] {
    const nativeLabels = Array.from(input.labels ?? []);

    const allLabels: string[] = nativeLabels.map(label => label.innerText);

    

    const prevElement = input.previousElementSibling;
    const nextElement = input.nextElementSibling;

    if (prevElement?.tagName === 'LABEL') {
      const label = prevElement as HTMLLabelElement;
      allLabels.push(label.innerText);
    }

    if (nextElement?.tagName === 'LABEL') {
      const label = nextElement as HTMLLabelElement;
      allLabels.push(label.innerText);
    }

    return allLabels;
  }

  static stringFuzzyContainsAny(string1: string, matches: string[]): boolean {
    if (string1 === undefined || string1 === null) {
      return false;
    }

    const result = matches.find(match => {
      return PageAnalyser.stringFuzzyContains(string1, match);
    });

    return result != undefined;
  }

  static stringFuzzyContains(string1: string, match: string) {
    const value1 = string1
      .replace(/(?:\r\n|\r|\n)/g, '')
      .trim()
      .toLowerCase();

    return value1.indexOf(match.toLowerCase()) !== -1;
  }

  static isInputVisible(element: HTMLInputElement) {
    let theEl: HTMLElement | null = element as HTMLElement;

    for (; theEl; ) {
      
      if (!!(theEl.offsetParent || theEl.offsetWidth || theEl.offsetHeight || theEl.getClientRects().length) === false) {
        
        return false;
      }

      const style = theEl.style;

      if ('none' === style.display || 'hidden' == style.visibility) {
        
        return false;
      }
      const computedStyle = getComputedStyle(theEl);
      if ('none' === computedStyle.display || 'hidden' == computedStyle.visibility) {
        
        return false;
      }

      theEl = theEl.parentElement;
    }

    return true;
  }

  static isInputInViewport(el: HTMLInputElement) {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }

  static async checkInputIsInViewPortUsingIntersectionObserver(targetField: HTMLInputElement) {
    return new Promise((resolve, reject) => {
      if (!targetField) {
        reject('');
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            resolve(true);
          } else {
            
            resolve(false);
          }

          observer.disconnect();
        });
      });

      observer.observe(targetField);
    });
  }
}
