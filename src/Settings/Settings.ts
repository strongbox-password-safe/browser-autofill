export enum LightOrDarkAppearance {
  dark,
  light,
  system,
}

export enum FontSize {
  small = 20,
  medium = 16,
  large = 12,
  xl = 10,
}

export enum Spacing {
  small = 4,
  medium = 6,
  large = 8,
}

export class LastKnownDatabasesItem {
  nickName = '';
  uuid = '';

  constructor(nickName: string, uuid: string) {
    this.nickName = nickName;
    this.uuid = uuid;
  }
}

export class Settings {
  lng = String();
  lastSelectedNewEntryGroupUuidForDatabase = new Map<string, string>();
  autoFillImmediatelyIfOnlyASingleMatch = false;
  autoFillImmediatelyWithFirstMatch = false;
  showMatchCountOnPopupBadge = true;
  showInlineIconAndPopupMenu = true;
  lastKnownDatabases: LastKnownDatabasesItem[] = [];
  doNotShowInlineMenusOnDomains: string[] = [];
  doNotShowInlineMenusOnPages: string[] = [];
  doNotFillOnDomains: string[] = [];

  
  lightOrDarkAppearance: number = LightOrDarkAppearance.system;
  fontSize: number = FontSize.medium;
  spacing: number = Spacing.medium;

  
  hideCredentialDetailsOnPopup = false;
  hideCredentialDetailsOnInlineMenu = false;

  static prepUrlForDoNotRunList(url: string) {
    const a = document.createElement('a');
    a.href = url;
    return a.hostname.toLocaleLowerCase();
  }

  static prepUrlPageForDoNotRunList(url: string) {
    const a = document.createElement('a');
    a.href = url;
    return a.hostname.toLocaleLowerCase() + a.pathname.toLocaleLowerCase();
  }

  static isUrlIsInDoNotShowInlineMenusList(settings: Settings, url: string) {
    const prepped = Settings.prepUrlForDoNotRunList(url);
    const domains = settings.doNotShowInlineMenusOnDomains ?? [];
    const ret = domains.indexOf(prepped) > -1;

    

    return ret;
  }

  static isUrlPageIsInDoNotShowInlineMenusList(settings: Settings, url: string) {
    const prepped = Settings.prepUrlPageForDoNotRunList(url);
    const pages = settings.doNotShowInlineMenusOnPages ?? [];
    const ret = pages.indexOf(prepped) > -1;

    

    return ret;
  }

  static isUrlInDoNotFillList(settings: Settings, url: string) {
    const prepped = Settings.prepUrlForDoNotRunList(url);
    const domains = settings.doNotFillOnDomains ?? [];
    const ret = domains.indexOf(prepped) > -1;

    

    return ret;
  }
}
