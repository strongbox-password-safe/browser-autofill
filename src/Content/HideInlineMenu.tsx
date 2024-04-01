import * as React from 'react';

import { Menu, MenuItem } from '@mui/material';
import { Settings } from '../Settings/Settings';
import { SettingsStore } from '../Settings/SettingsStore';
import { useTranslation } from 'react-i18next';

export interface CreateNewEntryDialogProps {
  url: string;
  anchorEl: HTMLInputElement | null;
  open: boolean;
  hideInlineMenusForAWhile: () => void;
  setOpenHideMenu: (value: boolean) => void;
  notifyAction: (message: string) => void;
  onCloseMenu: () => void;
}

enum HideMenuOptions {
  ForAWhile = 1,
  OnPage,
  OnDomain,
}

export default function HideInlineMenu(props: CreateNewEntryDialogProps) {
  const [settings, setSettings] = React.useState<Settings>(new Settings());
  const [t] = useTranslation('global');

  React.useEffect(() => {
    async function getStoredSettings() {
      const stored = await SettingsStore.getSettings();
      setSettings(stored);
    }

    getStoredSettings();
  }, []);

  const handleSave = async (hideMenuOption: HideMenuOptions) => {
    let message = '';

    switch (hideMenuOption) {
      case HideMenuOptions.ForAWhile: {
        message = t('notification-toast.hide-for-a-while');
        props.hideInlineMenusForAWhile();
        break;
      }
      case HideMenuOptions.OnPage: {
        message = t('notification-toast.hide-on-this-page');
        await addThisPageToDoNotRunList(props.url);
        break;
      }
      case HideMenuOptions.OnDomain: {
        message = t('notification-toast.hide-on-this-domain');

        await addThisDomainToDoNotRunList(props.url);
        break;
      }
      default:
        break;
    }

    props.notifyAction(message);
  };

  const addThisDomainToDoNotRunList = async (url: string) => {
    if (!settings.doNotShowInlineMenusOnDomains) {
      settings.doNotShowInlineMenusOnDomains = [];
    }

    settings.doNotShowInlineMenusOnDomains.push(Settings.prepUrlForDoNotRunList(url));

    
    const uniqueItems = [...new Set(settings.doNotShowInlineMenusOnDomains)];
    settings.doNotShowInlineMenusOnDomains = uniqueItems;

    SettingsStore.setSettings(settings);
    const newSettings = await SettingsStore.getSettings();
    setSettings(newSettings);
  };

  const addThisPageToDoNotRunList = async (url: string) => {
    if (!settings.doNotShowInlineMenusOnPages) {
      settings.doNotShowInlineMenusOnPages = [];
    }

    settings.doNotShowInlineMenusOnPages.push(Settings.prepUrlPageForDoNotRunList(url));

    
    const uniqueItems = [...new Set(settings.doNotShowInlineMenusOnPages)];
    settings.doNotShowInlineMenusOnPages = uniqueItems;

    SettingsStore.setSettings(settings);
    const newSettings = await SettingsStore.getSettings();
    setSettings(newSettings);
  };

  return (
    <Menu
      id="hide-menu"
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={props.onCloseMenu}
      sx={{ zIndex: '2147483642', minHeight: '400px', overflow: 'hidden' }}
      MenuListProps={{
        'aria-labelledby': 'hide-menu',
        sx: { p: 0 },
      }}
    >
      <MenuItem onClick={() => handleSave(HideMenuOptions.ForAWhile)}>{t('hide-inline-menu.hide-for-a-while')}</MenuItem>
      <MenuItem onClick={() => handleSave(HideMenuOptions.OnPage)}>{t('hide-inline-menu.hide-on-page')}</MenuItem>
      <MenuItem onClick={() => handleSave(HideMenuOptions.OnDomain)}>{t('hide-inline-menu.hide-on-domain')}</MenuItem>
    </Menu>
  );
}
