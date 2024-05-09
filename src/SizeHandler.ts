import { FontSize } from './Contexts/CustomStyleContext';
import { AutoFillCredential } from './Messaging/Protocol/AutoFillCredential';
import { Settings } from './Settings/Settings';

export const defaultIFrameExtraWidth = 10;
export const defaultIFrameExtraHeight = 10;

const popupComponent = {
  margin: {
    s: '0px',
    m: '0px',
    l: '10px',
    xl: '10px',
  },
};

const inlineMenu = {
  width: {
    s: '270px',
    m: '300px',
    l: '360px',
    xl: '380px',
  },
  height: {
    s: '184px',
    m: '210px',
    l: '255px',
    xl: '291px',
  },
  fontSize: {
    s: '10px',
    m: '11px',
    l: '13px',
    xl: '15px',
  },
  marginRight: {
    s: '10px',
    m: '25px',
    l: '35px',
    xl: '43px',
  },
};

const bottomToolbarIcon = {
  fontSize: {
    s: '15px',
    m: '20px',
    l: '22px',
    xl: '25px',
  },
};

const largeTextViewIcon = {
  fontSize: {
    s: '12px',
    m: '15px',
    l: '20px',
    xl: '22px',
  },
};

const credentialListItem = {
  width: {
    s: 135,
    m: 125,
    l: 110,
    xl: 95,
  },
};

const settingsPopupComponentList = {
  minWidth: {
    s: '400px',
    m: '400px',
    l: '550px',
    xl: '550px',
  },
};

const settingsPopupTabPanels = {
  width: {
    s: '290px',
    m: '290px',
    l: '390px',
    xl: '390px',
  },
};

const createnewEntryDialog = {
  maxWidth: {
    s: 'xs',
    m: 'xs',
    l: 'sm',
    xl: 'sm',
  },
};

export class SizeHandler {
  fontSize: FontSize;

  constructor(fontSize: FontSize) {
    this.fontSize = fontSize;
  }

  getInlineMenuWidth = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return inlineMenu.width.s;
      case FontSize.medium:
        return inlineMenu.width.m;
      case FontSize.large:
        return inlineMenu.width.l;
      case FontSize.xl:
        return inlineMenu.width.xl;
    }
  };

  getInlineMenuHeight = (inlineMenuTruncatedHeight: string | null) => {
    if (inlineMenuTruncatedHeight) {
      const height = Math.floor(parseInt(inlineMenuTruncatedHeight)) - 80;
      return `${height}px`;
    } else {
      switch (this.fontSize) {
        case FontSize.small:
          return inlineMenu.height.s;
        case FontSize.medium:
          return inlineMenu.height.m;
        case FontSize.large:
          return inlineMenu.height.l;
        case FontSize.xl:
          return inlineMenu.height.xl;
      }
    }
  };

  getInlineMenuFontSize = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return inlineMenu.fontSize.s;
      case FontSize.medium:
        return inlineMenu.fontSize.m;
      case FontSize.large:
        return inlineMenu.fontSize.l;
      case FontSize.xl:
        return inlineMenu.fontSize.xl;
    }
  };

  getBottomToolbarIconSize = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return bottomToolbarIcon.fontSize.s;
      case FontSize.medium:
        return bottomToolbarIcon.fontSize.m;
      case FontSize.large:
        return bottomToolbarIcon.fontSize.l;
      case FontSize.xl:
        return bottomToolbarIcon.fontSize.xl;
    }
  };

  getLargeTextViewIconSize = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return largeTextViewIcon.fontSize.s;
      case FontSize.medium:
        return largeTextViewIcon.fontSize.m;
      case FontSize.large:
        return largeTextViewIcon.fontSize.l;
      case FontSize.xl:
        return largeTextViewIcon.fontSize.xl;
    }
  };

  getInlineMenuMarginRight = (settings: Settings) => {
    if (!settings.hideCredentialDetailsOnInlineMenu) {
      return FontSize.xl == this.fontSize ? inlineMenu.marginRight.xl : this.fontSize == FontSize.large ? inlineMenu.marginRight.l : inlineMenu.marginRight.m;
    }

    return inlineMenu.marginRight.s;
  };

  getCredentialListItemWidth = (credential: AutoFillCredential, settings: Settings, isHovered: boolean, isSecondary = false) => {
    const favouriteStartWidth = 20;

    if (settings.hideCredentialDetailsOnPopup) {
      return 250;
    }

    if (isHovered) {
      const width =
        this.fontSize == FontSize.xl
          ? credentialListItem.width.xl
          : this.fontSize == FontSize.large
          ? credentialListItem.width.l
          : this.fontSize == FontSize.medium
          ? credentialListItem.width.m
          : credentialListItem.width.s;

      if (isSecondary) return width;
      return credential.favourite ? width - favouriteStartWidth : width;
    } else {
      const width = 200;

      if (credential.favourite && !isSecondary) {
        return width - favouriteStartWidth;
      }

      return width;
    }
  };

  getSettingsPopupListMinWidth = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return settingsPopupComponentList.minWidth.s;
      case FontSize.medium:
        return settingsPopupComponentList.minWidth.m;
      case FontSize.large:
        return settingsPopupComponentList.minWidth.l;
      case FontSize.xl:
        return settingsPopupComponentList.minWidth.xl;
    }
  };

  getSettingsPopupTabPanelsWidth = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return settingsPopupTabPanels.width.s;
      case FontSize.medium:
        return settingsPopupTabPanels.width.m;
      case FontSize.large:
        return settingsPopupTabPanels.width.l;
      case FontSize.xl:
        return settingsPopupTabPanels.width.xl;
    }
  };

  getPopupComponentMargin = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return popupComponent.margin.s;
      case FontSize.medium:
        return popupComponent.margin.m;
      case FontSize.large:
        return popupComponent.margin.l;
      case FontSize.xl:
        return popupComponent.margin.xl;
    }
  };

  getPopupTabTitle = (title: string, toolTip = false) => {
    return toolTip ? [FontSize.large, FontSize.xl].includes(this.fontSize) && title : ![FontSize.large, FontSize.xl].includes(this.fontSize) && title;
  };

  getCreatenewEntryDialogMaxWidth = () => {
    switch (this.fontSize) {
      case FontSize.small:
        return createnewEntryDialog.maxWidth.s;
      case FontSize.medium:
        return createnewEntryDialog.maxWidth.m;
      case FontSize.large:
        return createnewEntryDialog.maxWidth.l;
      case FontSize.xl:
        return createnewEntryDialog.maxWidth.xl;
    }
  };
}
