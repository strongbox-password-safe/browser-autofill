export class PageAnalyser {
    static getAllUsernameInputs(visible = true): HTMLInputElement[] {
        const all = this.getAllInputs(visible);

        const result = all.filter((input) => PageAnalyser.isUsernameInput(input));

        return result;
    }

    static getAllPasswordInputs(visible = true): HTMLInputElement[] {
        const all = this.getAllInputs(visible);

        const result = all.filter((input) => PageAnalyser.isPasswordInput(input));

        return result;
    }

    static getAllInputs(visible = true): HTMLInputElement[] {
        const inputs = Array.from<HTMLInputElement>(
            document.getElementsByTagName('input')
        );

        

        const iframes = Array.from<HTMLIFrameElement>(
            document.getElementsByTagName('iframe')
        );

        

        for (const iframe of iframes) {
            

            const iframeInputs = iframe.contentDocument?.getElementsByTagName('input');
            if (iframeInputs) {
                const iframeInputsArray = Array.from<HTMLInputElement>(iframeInputs);

                

                inputs.push(...iframeInputsArray);
            }
        }

        return inputs.filter(input => !visible || PageAnalyser.isInputVisible(input));
    }

    static isPasswordInput(input: HTMLInputElement) {
        return input.type === 'password'; 
    }

    static isUsernameInput(input: HTMLInputElement) {
        const isInteresting = input.type === 'email' ||
            input.type === 'text' ||
            input.type === 'username' ||
            input.type === 'tel';

        if (!isInteresting) {
            return false;
        }

        const usernameLikeFieldMatches = [
            "user",
            "email",
            "e-mail",
            "customer",
            "login",
            "acct",
            "account",
            "clientnumber",
            
            "benutzer",
            "alias"];

        

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

        input.labels?.forEach(label => {
            if (PageAnalyser.stringFuzzyContainsAny(label.innerText, matchNames)) {
                
                return true;
            }
        });

        

        for (let i = 0, atts = input.attributes, n = atts.length; i < n; i++) {
            const att = atts[i];
            

            if (att.nodeValue && PageAnalyser.stringFuzzyContainsAny(att.nodeValue, matchNames)) {
                return true;
            }
        }

        return false;
    }

    static stringFuzzyContainsAny(string1: string, matches: string[]): boolean {
        if (string1 === undefined || string1 === null) {
            return false;
        }

        const result = matches.find((match) => { return PageAnalyser.stringFuzzyContains(string1, match); });

        return result != undefined;
    }

    static stringFuzzyContains(string1: string, match: string) {
        const value1 = string1.replace(/(?:\r\n|\r|\n)/g, "").trim().toLowerCase();

        return value1.indexOf(match.toLowerCase()) !== -1;
    }

    static isInputVisible(element: HTMLInputElement) {
        let theEl: HTMLElement | null = element as HTMLElement;

        for (; theEl;) {
            
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
}