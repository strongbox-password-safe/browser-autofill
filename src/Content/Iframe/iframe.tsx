import React from 'react';
import { Root, createRoot } from 'react-dom/client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import { Utils } from '../../Utils';
import { ContentScriptManager, MainPageInformation } from '../ContentScriptManager';
import { IframeMessageTypes, IframeComponentTypes } from './iframeManager';


import CreateNewEntryDialog from '../CreateNewEntryDialog';
import NotificationToast from '../NotificationToast';
import InlineMiniFieldMenu from '../InlineMiniFieldMenu';


import { CustomStyleProvider, useCustomStyle } from '../../Contexts/CustomStyleContext';


import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { config } from '../../Localization/config';
import { NativeAppApi } from '../../Messaging/NativeAppApi';
import { defaultIFrameExtraHeight, defaultIFrameExtraWidth } from '../../SizeHandler';

const contentScriptManager = new ContentScriptManager();
const iframeRoot = document.getElementById('strongbox-autofill-iframe-root') ?? new HTMLElement();
const root: Root = createRoot(iframeRoot);

const emotionRoot = document.createElement('style');
document.head.appendChild(emotionRoot);
const cache = createCache({ key: 'css', prepend: true, container: emotionRoot });


function StyleWrapper({ children }: { children: React.ReactNode }) {
  const { getCustomStyle } = useCustomStyle();

  const theme = createTheme(getCustomStyle());

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}

async function render(iframeComponentType: IframeComponentTypes, data: MainPageInformation | string) {
  
  i18next.init(config);

  
  const component = await build(iframeComponentType, data);

  root.render(
    <I18nextProvider i18n={i18next}>
      <CustomStyleProvider>
        <StyleWrapper>{component}</StyleWrapper>
      </CustomStyleProvider>
    </I18nextProvider>
  );

  
  setTimeout(() => {
    resize();
  }, 50);
}

async function build(iframeComponentType: IframeComponentTypes, data: MainPageInformation | string) {
  switch (iframeComponentType) {
    case IframeComponentTypes.InlineMiniFieldMenu:
      return await buildInlineMiniFieldMenu(data as MainPageInformation);
    case IframeComponentTypes.CreateNewEntryDialog:
      return await buildCreateNewEntryDialog(data as MainPageInformation);
    case IframeComponentTypes.NotificationToast:
      return await buildNotificationToast(data as string);
  }
}

async function buildInlineMiniFieldMenu(mainPageInformation: MainPageInformation) {
  const nativeAppApi = NativeAppApi.getInstance();

  const status = await contentScriptManager.getStatus();
  const showCreateNew = status?.serverSettings?.supportsCreateNew ?? false;
  const unlockedDatabaseAvailable = status ? status.databases.filter(database => database.autoFillEnabled && !database.locked).length != 0 : false;

  const unlockableDatabases = await contentScriptManager.getUnlockableDatabases(status);

  const credentials = status == null ? [] : (await contentScriptManager.getCredentials(0, nativeAppApi.credentialResultsPageSize)) ?? [];

  const menuComponent = React.createElement(InlineMiniFieldMenu, {
    status,
    url: mainPageInformation.url,
    inlineMenuTruncatedHeight: mainPageInformation.inlineMenuTruncatedHeight,
    unlockedDatabaseAvailable,
    showCreateNew: showCreateNew && unlockedDatabaseAvailable,
    credentials,
    unlockableDatabases: unlockableDatabases,
    getCredentials: async (skip: number, take: number) => {
      return (await contentScriptManager.getCredentials(skip, take)) ?? [];
    },
    onCreateNewEntry: () => {
      parent.postMessage({ type: IframeMessageTypes.showCreateNewEntryDialog, data: mainPageInformation }, '*');
    },
    onUnlockDatabase: async (databaseUuid: string) => {
      const unlockResponse = await contentScriptManager.unlockDatabase(databaseUuid);
      return unlockResponse;
    },
    onFillWithCredential: async credential => {
      parent.postMessage({ type: IframeMessageTypes.onFillWithCredential, data: credential }, '*');
    },
    onFillSingleField: async (text, appendValue) => {
      parent.postMessage({ type: IframeMessageTypes.onFillSingleField, data: { text, appendValue } }, '*');
    },
    onCopyUsername: credential => {
      contentScriptManager.onCopyUsername(credential);
    },
    onCopyPassword: credential => {
      contentScriptManager.onCopyPassword(credential);
    },
    onCopyTotp: credential => {
      contentScriptManager.onCopyTotp(credential);
    },
    onCopy: async text => {
      parent.postMessage({ type: IframeMessageTypes.onCopy, data: text }, '*');
      return true;
    },
    onRedirectUrl: url => {
      parent.postMessage({ type: IframeMessageTypes.onRedirectUrl, data: url }, '*');
    },
    refreshInlineMenu: async () => {
      parent.postMessage({ type: IframeMessageTypes.backToInlineMiniFieldMenu }, '*');
    },
    beforeOpenSubMenu: (showDetails = false, restoreIframeSize = false) => {
      if (restoreIframeSize) {
        resize();
        return;
      }

      
      
      if (showDetails) {
        resize(330, 220);
      } else {
        if (iframeRoot.offsetHeight < 180) {
          resize(undefined, 120); 
        }
      }
    },
    hideInlineMenusForAWhile: () => {
      parent.postMessage({ type: IframeMessageTypes.hideInlineMenusForAWhile }, '*');
    },
    showLargeTextView: () => {
      parent.postMessage({ type: IframeMessageTypes.showLargeTextView }, '*');
    },
    notifyAction: message => {
      parent.postMessage({ type: IframeMessageTypes.showNotificationToast, data: message }, '*');
    },
    searchCredentials: async (query: string, skip: number, take: number) => {
      return await contentScriptManager.getSearchCredentials(query, skip, take);
    },
    getIcon: async (databaseId: string, nodeId: string) => {
      return await contentScriptManager.getIcon(databaseId, nodeId);
    },
    resize,
  });

  return menuComponent;
}

async function buildCreateNewEntryDialog({ title, url, favIconBase64, favIconUrl }: MainPageInformation) {
  const createNewEntryDialog = React.createElement(CreateNewEntryDialog, {
    title,
    url,
    favIconBase64,
    favIconUrl,
    getStatus: async () => {
      const status = await contentScriptManager.getStatus();
      return status;
    },
    getGroups: async request => {
      const response = await contentScriptManager.getGroups(request);
      return response;
    },
    getNewEntryDefaultsV2: async request => {
      const response = await contentScriptManager.getNewEntryDefaultsV2(request);
      return response;
    },
    generatePasswordV2: async () => {
      const response = await contentScriptManager.generatePasswordV2();
      return response;
    },
    getPasswordStrength: async request => {
      const response = await contentScriptManager.getPasswordStrength(request);
      return response;
    },
    onCreate: async details => {
      const response = await contentScriptManager.createNewEntry(details);
      return response;
    },
    onCreatedItem: (credential, message) => {
      parent.postMessage({ type: IframeMessageTypes.onCreatedNewItem, data: { credential, message } }, '*');
    },
    key: Utils.getUUIDString(), 
    unlockDatabase: async uuid => {
      const response = await contentScriptManager.unlockDatabase(uuid);
      return response;
    },
    handleClose: () => {
      parent.postMessage({ type: IframeMessageTypes.remove }, '*');
    },
    notifyAction: message => {
      parent.postMessage({ type: IframeMessageTypes.showNotificationToast, data: message }, '*');
    },
  });

  return createNewEntryDialog;
}

async function buildNotificationToast(message: string) {
  const snackbar = React.createElement(NotificationToast, {
    message,
    handleClose: () => {
      parent.postMessage({ type: IframeMessageTypes.remove }, '*');
    },
  });

  return snackbar;
}

function resize(extraWidth = defaultIFrameExtraWidth, extraHeight = defaultIFrameExtraHeight) {
  
  const children = iframeRoot.children[0] as HTMLElement;
  if (children) {
    parent.postMessage(
      {
        type: IframeMessageTypes.resize,
        data: {
          width: `${children.offsetWidth + extraWidth}px`,
          height: `${children.offsetHeight + extraHeight}px`,
        },
      },
      '*'
    );
  }
}

function onIFrameKeyup(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    parent.postMessage(
      {
        type: IframeMessageTypes.remove,
      },
      '*'
    );
  } else if (event.key === 'ArrowLeft') {
    const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

    const activeElement = document.activeElement;
    if (activeElement) {
      const index = Array.from(focusableElements).indexOf(activeElement);

      if (index !== -1 && index > 0) {
        const el = focusableElements[index - 1] as HTMLElement;
        el.focus();
      }
    }
  } else if (event.key === 'ArrowRight') {
    const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

    const activeElement = document.activeElement;
    if (activeElement) {
      const index = Array.from(focusableElements).indexOf(activeElement);
      if (index !== -1 && index < focusableElements.length - 1) {
        const el = focusableElements[index + 1] as HTMLElement;
        el.focus();
      }
    }
  }
}

function initScrollbars(showScrollbars: boolean) {
  if (!showScrollbars) {
    const styleElement = document.createElement('style');

    const cssRules = `
          div::-webkit-scrollbar { width: 0; display: none; } 
          div { overflow: -moz-scrollbars-none; -ms-overflow-style: none; scrollbar-width: none; }`;

    styleElement.innerHTML = cssRules;
    styleElement.id = 'hide-scrollbar-style';
    document.head.appendChild(styleElement);
  }
}

async function onMessageReceivedFromMainPage(event: MessageEvent) {
  const iframeComponentType = event.data.data.iframeComponentType as IframeComponentTypes;

  switch (event.data.type) {
    case IframeMessageTypes.render: {
      switch (iframeComponentType) {
        case IframeComponentTypes.InlineMiniFieldMenu:
        case IframeComponentTypes.CreateNewEntryDialog: {
          const { showScrollbars } = event.data.data;
          initScrollbars(showScrollbars);

          const mainPageInformation: MainPageInformation = event.data.data.mainPageInformation;
          await render(iframeComponentType, mainPageInformation);
          break;
        }
        case IframeComponentTypes.NotificationToast: {
          const message: string = event.data.data.message;
          await render(iframeComponentType, message);
          break;
        }
        default:
          break;
      }
      break;
    }
    default:
      break;
  }
}


window.addEventListener('message', onMessageReceivedFromMainPage);

window.addEventListener('keyup', onIFrameKeyup);
