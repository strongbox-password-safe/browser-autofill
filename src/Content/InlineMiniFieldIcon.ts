import ReactDOM from 'react-dom/client';
import browser from 'webextension-polyfill';

export class InlineMiniFieldIcon {
  fieldElement: HTMLInputElement;
  iconElement: HTMLElement;
  reactRoot: ReactDOM.Root;

  isVisible: boolean;

  static readonly INLINE_ICON_SHADOW_CONTAINER_ID = 'strongbox-cs-inline-icon-shadow-container';

  static ensureShadow() {
    const found = document.getElementById(InlineMiniFieldIcon.INLINE_ICON_SHADOW_CONTAINER_ID);
    if (!found) {
      const created = document.createElement('div');
      created.id = InlineMiniFieldIcon.INLINE_ICON_SHADOW_CONTAINER_ID;
      document.body.append(created);
      created.attachShadow({ mode: 'open' });
    }
  }

  static getShadowRoot(): ShadowRoot | null {
    InlineMiniFieldIcon.ensureShadow();

    const found = document.getElementById(InlineMiniFieldIcon.INLINE_ICON_SHADOW_CONTAINER_ID);

    return found?.shadowRoot ?? null;
  }

  static attachToField(field: HTMLInputElement, disconnected: boolean, clickHandler: () => void): InlineMiniFieldIcon {
    
    
    
    

    const icon = document.createElement('div'); 
    icon.style.zIndex = '2147483640';
    icon.style.backgroundImage = 'url(' + browser.runtime.getURL('assets/icons/app-icon-circle.png') + ')';
    icon.style.filter = disconnected ? 'saturate(0%)' : '';
    icon.style.backgroundSize = 'contain';
    icon.style.position = 'absolute';

    InlineMiniFieldIcon.getShadowRoot()?.append(icon);

    const miniIcon = new InlineMiniFieldIcon();

    miniIcon.fieldElement = field;
    miniIcon.iconElement = icon;

    miniIcon.bindIconPosition();
    miniIcon.bindVisibilityToFocus();

    

    miniIcon.iconElement.addEventListener('click', () => {
      clickHandler();
    });

    return miniIcon;
  }

  detach() {
    
    this.show(false);
    
  }

  async show(show = true) {
    if (show == this.isVisible) {
      return;
    }

    if (!show) {
      this.iconElement.style.display = 'none';
      this.isVisible = false;
    } else {
      this.iconElement.style.removeProperty('display');
      this.isVisible = true;

      
    }
  }

  async bindVisibilityToFocus() {
    const isDomFocused = document.activeElement === this.fieldElement;


    await this.show(isDomFocused);
  }

  bindIconPosition() {
    
    

    const size = this.fieldElement.offsetHeight > 28 ? 24 : 16;
    this.iconElement.style.width = InlineMiniFieldIcon.pixelsCssString(size);
    this.iconElement.style.height = InlineMiniFieldIcon.pixelsCssString(size);

    const rect = this.fieldElement.getBoundingClientRect();
    const left = InlineMiniFieldIcon.getRelativeLeftPosition(rect);
    const top = InlineMiniFieldIcon.getRelativeTopPosition(rect);

    const scrollTop = document.scrollingElement ? document.scrollingElement.scrollTop : 0;
    const scrollLeft = document.scrollingElement ? document.scrollingElement.scrollLeft : 0;

    const offset = InlineMiniFieldIcon.calculateIconOffset(this.fieldElement, size);

    this.iconElement.style.top = InlineMiniFieldIcon.pixelsCssString(top + scrollTop + offset);
    this.iconElement.style.left = InlineMiniFieldIcon.pixelsCssString(left + scrollLeft + this.fieldElement.offsetWidth - size - offset);
  }

  static calculateIconOffset(field: HTMLElement, size: number) {
    const middle = field.offsetHeight / 2;
    const foo = middle - size / 2;

    const offset = foo; 

    return offset < 0 ? 0 : offset;
  }

  static getRelativeLeftPosition(rect: DOMRect) {
    return rect.left; 

    
  }

  static getRelativeTopPosition(rect: DOMRect) {
    return rect.top; 

    
  }

  static pixelsCssString(value: number) {
    return String(value) + 'px';
  }
}
