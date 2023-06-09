export class LastKnownDatabasesItem {
    nickName = '';
    uuid = '';

    constructor(nickName: string, uuid: string) {
        this.nickName = nickName;
        this.uuid = uuid;
    }
}

export class Settings {
    autoFillImmediatelyIfOnlyASingleMatch = true;
    autoFillImmediatelyWithFirstMatch = false;
    showMatchCountOnPopupBadge = true;
    showInlineIconAndPopupMenu = true;
    lastKnownDatabases: LastKnownDatabasesItem[] = [];
    doNotShowInlineMenusOnDomains: string[] = [];

    static prepUrlForDoNotRunList(url: string) {
        const a = document.createElement('a');
        a.href = url;
        return a.hostname.toLocaleLowerCase();
    }

    static isUrlIsInDoNotShowInlineMenusList(settings: Settings, url: string) {
        const prepped = Settings.prepUrlForDoNotRunList(url);
        const domains = (settings.doNotShowInlineMenusOnDomains ?? []);
        const ret = domains.indexOf(prepped) > -1;

        

        return ret;
    }
}
