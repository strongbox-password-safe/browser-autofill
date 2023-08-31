export class Utils {
  static getUUIDString(): string {
    const S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  }

  static getImageElementBase64PNGData(image: HTMLImageElement): string | null {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    if (canvas == null) {
      return null;
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');
    if (context == null) {
      return null;
    }

    context.drawImage(image, 0, 0);

    const dataURL = canvas.toDataURL(); 

    const base64 = dataURL.replace('data:', '').replace(/^.+,/, '');

    return base64;
  }

  static quickHashString(str: string): number {
    
    let hash = 0,
      i,
      chr;

    if (str.length === 0) return hash;

    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; 
    }

    return hash;
  }

  static isFirefox(): boolean {
    return navigator.userAgent.indexOf(' Firefox/') !== -1 || navigator.userAgent.indexOf(' Gecko/') !== -1;
  }

  static isMacintosh(): boolean {
    return navigator.platform.indexOf('Mac') > -1;
  }
}
