import { AutoFillCredential } from "../Messaging/Protocol/AutoFillCredential";
import { GetStatusResponse } from "../Messaging/Protocol/GetStatusResponse";
import { AutoFiller } from "./AutoFiller";
import browser from 'webextension-polyfill';
import { CreateEntryRequest } from "../Messaging/Protocol/CreateEntryRequest";
import { CreateEntryResponse } from "../Messaging/Protocol/CreateEntryResponse";
import ReactDOM from 'react-dom/client';
import CreateNewEntryDialog from "./CreateNewEntryDialog";
import React from "react";
import { Utils } from "../Utils";
import { GetGroupsResponse } from "../Messaging/Protocol/GetGroupsResponse";
import { GetGroupsRequest } from "../Messaging/Protocol/GetGroupsRequest";
import { GetNewEntryDefaultsRequest } from "../Messaging/Protocol/GetNewEntryDefaultsRequest";
import { GetNewEntryDefaultsResponse } from "../Messaging/Protocol/GetNewEntryDefaultsResponse";
import { GeneratePasswordRequest } from "../Messaging/Protocol/GeneratePasswordRequest";
import { GeneratePasswordResponse } from "../Messaging/Protocol/GeneratePasswordResponse";
import NotificationToast from "./NotificationToast";
import { UnlockResponse } from "../Messaging/Protocol/UnlockResponse";
import { PageAnalyser } from "./PageAnalyser";
import InlineMiniFieldMenu from "./InlineMiniFieldMenu";
import { SettingsStore } from "../Settings/SettingsStore";
import createCache, { EmotionCache } from '@emotion/cache';
import { LastKnownDatabasesItem, Settings } from "../Settings/Settings";

export class ContentScriptManager {
    pageLoadFillDone = false;
    reactRoot: ReactDOM.Root;
    reactRootPopupMenu: ReactDOM.Root | null;
    currentlyFocusedInputElement: HTMLElement | null;

    constructor() {
    }

    onDOMLoaded() {

        this.addFocusListener();
        

        
        
        

        
        
        
        

        
        
        
        
        

        this.bindToFocus();
    }

    
    
    

    
    
    

    async getStatus(): Promise<GetStatusResponse | null> {
        const ret = await browser.runtime.sendMessage({ type: "get-status" });

        

        return ret;
    }

    async getCredentials(): Promise<AutoFillCredential[] | null> {
        const ret = await browser.runtime.sendMessage({ type: "get-credentials" });

        

        return ret;
    }

    async getGroups(request: GetGroupsRequest): Promise<GetGroupsResponse | null> {
        const ret = await browser.runtime.sendMessage({ type: "get-groups", details: request });

        

        return ret;
    }

    async launchStrongbox() {
        const ret = await browser.runtime.sendMessage({ type: "launch-strongbox" });

        

        return ret;
    }

    async onCopyUsername(credential: AutoFillCredential) {
        await browser.runtime.sendMessage({ type: "copy-username", details: credential });
    }

    async onCopyPassword(credential: AutoFillCredential) {
        await browser.runtime.sendMessage({ type: "copy-password", details: credential });
    }

    async onCopyTotp(credential: AutoFillCredential) {
        await browser.runtime.sendMessage({ type: "copy-totp", details: credential });
    }

    async unlockDatabase(uuid: string): Promise<UnlockResponse | null> {
        const ret = await browser.runtime.sendMessage({
            type: "unlock-database", details: {
                uuid: uuid,
            }
        });

        

        return ret;
    }

    async getNewEntryDefaults(request: GetNewEntryDefaultsRequest): Promise<GetNewEntryDefaultsResponse | null> {
        const ret = await browser.runtime.sendMessage({ type: "get-new-entry-defaults", details: request });

        

        return ret;
    }

    async generatePassword(request: GeneratePasswordRequest): Promise<GeneratePasswordResponse | null> {
        const ret = await browser.runtime.sendMessage({ type: "generate-password", details: request });

        

        return ret;
    }

    async createNewEntry(details: CreateEntryRequest): Promise<CreateEntryResponse | null> {
        const ret = await browser.runtime.sendMessage({ type: "create-new-entry", details: details });

        

        return ret;
    }

    async copyTotpCodeIfConfiguredAfterFill(details: AutoFillCredential): Promise<void> {
        const ret = await browser.runtime.sendMessage({ type: "copy-totp-after-fill", details: details });

        

        return ret;
    }

    async getCurrentTab(): Promise<browser.Tabs.Tab | null> {
        const ret = await browser.runtime.sendMessage({ type: "get-tab-for-this-content-script" });

        

        return ret;
    }

    onCreatedNewItem(credential: AutoFillCredential) {
        this.showNotificationToast();

        this.onFillWithCredential(credential);
    }

    

    snackBarShadowRoot: HTMLElement;
    snackBarEmotionCache: EmotionCache;
    snackBarReactRoot: ReactDOM.Root;
    static readonly SNACKBAR_SHADOW_CONTAINER_ID = 'strongbox-cs-snackbar-shadow-container';

    ensureSnackBarRoot() {
        const found = document.getElementById(ContentScriptManager.SNACKBAR_SHADOW_CONTAINER_ID);
        if (!found) {
            const created = document.createElement('div');
            created.id = ContentScriptManager.SNACKBAR_SHADOW_CONTAINER_ID;
            document.body.append(created);

            const shadowContainer = created.attachShadow({ mode: 'open' });
            const emotionRoot = document.createElement('style');
            const shadowRootElement = document.createElement('div');
            shadowContainer.appendChild(emotionRoot);
            shadowContainer.appendChild(shadowRootElement);

            this.snackBarEmotionCache = createCache({
                key: 'css',
                prepend: true,
                container: emotionRoot,
            });

            this.snackBarShadowRoot = shadowRootElement;
            this.snackBarReactRoot = ReactDOM.createRoot(this.snackBarShadowRoot);
        }
    }

    showNotificationToast() {
        this.ensureSnackBarRoot();

        const snackbar = React.createElement(NotificationToast, {
            key: Utils.getUUIDString(), 
            shadowRootElement: this.snackBarShadowRoot,
            cache: this.snackBarEmotionCache,
        });

        this.snackBarReactRoot.render(snackbar);
    }

    

    createNewDialogShadowRoot: HTMLElement;
    createNewDialogEmotionCache: EmotionCache;
    createNewDialogReactRoot: ReactDOM.Root;
    static readonly CREATE_NEW_DIALOG_SHADOW_CONTAINER_ID = 'strongbox-cs-create-new-dialog-shadow-container';

    ensureCreateNewDialogRoot() {
        const found = document.getElementById(ContentScriptManager.CREATE_NEW_DIALOG_SHADOW_CONTAINER_ID);
        if (!found) {
            const created = document.createElement('div');
            created.id = ContentScriptManager.CREATE_NEW_DIALOG_SHADOW_CONTAINER_ID;
            document.body.append(created);

            const shadowContainer = created.attachShadow({ mode: 'open' });
            const emotionRoot = document.createElement('style');
            const shadowRootElement = document.createElement('div');
            shadowContainer.appendChild(emotionRoot);
            shadowContainer.appendChild(shadowRootElement);

            this.createNewDialogEmotionCache = createCache({
                key: 'css',
                prepend: true,
                container: emotionRoot,
            });

            this.createNewDialogShadowRoot = shadowRootElement;
            this.createNewDialogReactRoot = ReactDOM.createRoot(this.createNewDialogShadowRoot);
        }
    }

    async showCreateNewEntryDialog() {
        this.ensureCreateNewDialogRoot();

        const url = await this.getFavIconUrl();

        const favIconBase64 = url ? await this.getFavIconBase64Data(url) : null;
        const isDefaultFavIcon = favIconBase64 == null;
        const favIconUrl: string | null = isDefaultFavIcon ? null : url;

        const dialog = React.createElement(CreateNewEntryDialog, {
            getStatus: async () => { const status = await this.getStatus(); return status; },
            getGroups: async (request) => { const response = await this.getGroups(request); return response; },
            getNewEntryDefaults: async (request) => { const response = await this.getNewEntryDefaults(request); return response; },
            generatePassword: async (request) => { const response = await this.generatePassword(request); return response; },
            faviconUrl: favIconUrl,
            onCreate: async (details) => { const response = await this.createNewEntry(details); return response; },
            onCreatedItem: (credential) => { this.onCreatedNewItem(credential); },
            key: Utils.getUUIDString(), 
            unlockDatabase: async (uuid) => { const response = await this.unlockDatabase(uuid); return response; },
            shadowRootElement: this.createNewDialogShadowRoot,
            cache: this.createNewDialogEmotionCache,
            favIconBase64: favIconBase64,
        });

        this.createNewDialogReactRoot.render(dialog);
    }

    async getFavIconBase64Data(url: string): Promise<string | null> {
        

        const testImg = document.createElement('img') as HTMLImageElement;
        if (testImg === null) {
            return null;
        }

        testImg.src = url;

        try {
            await testImg.decode();
        } catch (error) {
            return null;
        }

        const imageData = Utils.getImageElementBase64PNGData(testImg);

        if (imageData && imageData?.length > 20 * 1024) {
            
            
            return null;
        }

        
        
        

        const chromeDefaultFavIconHash = -1499456902;
        if (imageData == null || testImg.naturalHeight === 0) {
            
            
            return null;
        }
        else if (Utils.quickHashString(imageData) === chromeDefaultFavIconHash) {
            return null;
        }

        return imageData;
    }

    private async getFavIconUrl(): Promise<string | null> {
        if (Utils.isFirefox()) {
            const thisTab = await this.getCurrentTab();
            return thisTab?.favIconUrl ?? null;
        }
        else {
            const url = new URL(browser.runtime.getURL("/_favicon/"));
            url.searchParams.set("pageUrl", document.location.href);
            url.searchParams.set("size", "128");
            return url.toString();
        }
    }

    handleSaveNewEntry(details: CreateEntryRequest) {
        return this.createNewEntry(details);
    }

    

    listen = false; 
    focusOrBlurListener: EventListener = (event) => this.onFocusChanged(event);
    addFocusListener() {
        
        this.listen = true;
        document.addEventListener('focus', this.focusOrBlurListener, true);
        document.addEventListener('blur', this.focusOrBlurListener, true);
    }

    removeFocusListener() {
        
        this.listen = false;
        document.removeEventListener('focus', this.focusOrBlurListener, true);
        document.removeEventListener('blur', this.focusOrBlurListener, true);
    }

    timeout: NodeJS.Timeout | null;
    clearBlurTimeout() { 
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    async onFocusChanged(event: Event) {
        if (!this.listen) {
            
            return;
        }

        

        

        this.clearBlurTimeout();

        if (event.type === 'blur') { 
            this.timeout = setTimeout(() => { this.bindToFocus(); this.timeout = null; }, 200);
        }
        else {
            this.bindToFocus();
        }
    }

    async bindToFocus() {
        const focusedElement = document.activeElement as HTMLInputElement;

        

        
        
        
        

        
        
        
        
        

        const shouldRun = await this.shouldRun();
        if (!shouldRun) {
            return;
        }

        
        
        
        

        if (focusedElement) {
            const usernames = PageAnalyser.getAllUsernameInputs();
            const attachUsername = usernames.find(input => input == focusedElement);
            const passwords = PageAnalyser.getAllPasswordInputs();
            const attachPassword = passwords.find(input => input == focusedElement);

            if (attachUsername || attachPassword) {
                const isPasswordField = attachPassword !== undefined;


                const status = await this.getStatus();

                
                

                this.showInlineMenu(focusedElement, status, isPasswordField);
            }
            else {
            }
        }
        else {
        }
    }

    async onMiniIconClick(fieldElement: HTMLInputElement, isPasswordField: boolean) {
        this.removeFocusListener();
        this.clearBlurTimeout();

        const status = await this.getStatus();

        const noUnlockedDatabases = false;
        const singleAutoFillDatabaseUuid: string | null = null;

        
        
        

        
        
        
        
        
        
        
        
        
        
        

        if (noUnlockedDatabases && singleAutoFillDatabaseUuid) {
            await this.unlockDatabase(singleAutoFillDatabaseUuid);
        }
        else {
            await this.showInlineMenu(fieldElement, status, isPasswordField);
        }

        this.addFocusListener();
    }

    async getLastKnownAutoFillDatabases(): Promise<LastKnownDatabasesItem[]> {
        const stored = await SettingsStore.getSettings();
        return stored.lastKnownDatabases;
    }

    

    inlineMenuShadowRoot: HTMLElement;
    inlineMenuEmotionCache: EmotionCache;
    inlineMenuReactRoot: ReactDOM.Root;
    static readonly INLINE_MENU_SHADOW_CONTAINER_ID = 'strongbox-cs-inline-menu-shadow-container';

    ensureInlineMenuRoot() {
        const found = document.getElementById(ContentScriptManager.INLINE_MENU_SHADOW_CONTAINER_ID);
        if (!found) {
            const created = document.createElement('div');
            created.id = ContentScriptManager.INLINE_MENU_SHADOW_CONTAINER_ID;
            document.body.append(created);

            const shadowContainer = created.attachShadow({ mode: 'open' });
            const emotionRoot = document.createElement('style');
            const shadowRootElement = document.createElement('div');
            shadowContainer.appendChild(emotionRoot);
            shadowContainer.appendChild(shadowRootElement);

            this.inlineMenuEmotionCache = createCache({
                key: 'css',
                prepend: true,
                container: emotionRoot,
            });

            this.inlineMenuShadowRoot = shadowRootElement;
            this.inlineMenuReactRoot = ReactDOM.createRoot(this.inlineMenuShadowRoot);
        }
    }

    async shouldRun(): Promise<boolean> {
        const settings = await SettingsStore.getSettings();
        if (!settings.showInlineIconAndPopupMenu || Settings.isUrlIsInDoNotShowInlineMenusList(settings, document.location.href)) {
            return false;
        }

        return true;
    }

    async showInlineMenu(fieldElement: HTMLInputElement, status: GetStatusResponse | null, isPasswordField: boolean, show = true) {
        

        const shouldRun = await this.shouldRun();
        if (!shouldRun) {
            return;
        }

        this.ensureInlineMenuRoot();

        if (status == null) {
        }

        const showCreateNew = status?.serverSettings?.supportsCreateNew ?? false;
        const unlockedDatabaseAvailable = status ? status.databases.filter(database => database.autoFillEnabled && !database.locked).length != 0 : false;

        const credentials = status == null ? [] : (await this.getCredentials() ?? []);

        const unlockableDatabases = await this.getUnlockableDatabases(status);

        const menuComponent = React.createElement(InlineMiniFieldMenu, {
            anchorEl: fieldElement,
            unlockedDatabaseAvailable: unlockedDatabaseAvailable,
            key: Utils.getUUIDString(), 
            credentials: credentials,
            showCreateNew: showCreateNew && unlockedDatabaseAvailable,
            onCreateNewEntry: () => { this.showCreateNewEntryDialog(); },
            onLaunchStrongbox: () => { this.launchStrongbox(); },
            onUnlockDatabase: async (databaseUuid: string) => { await this.unlockDatabase(databaseUuid); },
            onFillWithCredential: async (credential) => { await this.onFillWithCredential(credential, fieldElement, isPasswordField); },
            isPasswordField: isPasswordField,
            shadowRootElement: this.inlineMenuShadowRoot,
            cache: this.inlineMenuEmotionCache,
            show: show,
            unlockableDatabases: unlockableDatabases,
            onCopyUsername: (credential) => { this.onCopyUsername(credential); },
            onCopyPassword: (credential) => { this.onCopyPassword(credential); },
            onCopyTotp: (credential) => { this.onCopyTotp(credential); },
        });

        await this.inlineMenuReactRoot.render(menuComponent);
    }

    async getUnlockableDatabases(status: GetStatusResponse | null): Promise<LastKnownDatabasesItem[]> {
        if (status) {
            return status.databases.filter(database => database.autoFillEnabled && database.locked).map(database => new LastKnownDatabasesItem(database.nickName, database.uuid));
        }
        else {
            const stored = await SettingsStore.getSettings();
            return stored.lastKnownDatabases;
        }
    }

    async onFillWithCredential(credential: AutoFillCredential, inlineFieldInitiator: HTMLInputElement | null = null, inlineFieldInitiatorIsPassword = false) {
        await this.autoFillWithCredential(credential, false, inlineFieldInitiator, inlineFieldInitiatorIsPassword);
    }

    async autoFillWithCredential(credential: AutoFillCredential,
        isPageLoadFill = false,
        inlineFieldInitiator: HTMLInputElement | null = null,
        inlineFieldInitiatorIsPassword = false,
        fillMultiple = false): Promise<boolean> {

        if (isPageLoadFill) {

            if (this.pageLoadFillDone) {
                return false;
            }

            this.pageLoadFillDone = true;
        }

        

        this.removeFocusListener();

        const autoFiller = new AutoFiller();
        const filled = await autoFiller.doIt(credential, inlineFieldInitiator, inlineFieldInitiatorIsPassword, fillMultiple, isPageLoadFill);

        setTimeout(() => { this.addFocusListener(); }, 500);

        if (filled) {
            this.copyTotpCodeIfConfiguredAfterFill(credential);
        }

        return filled;
    }
}