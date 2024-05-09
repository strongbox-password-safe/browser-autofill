import { Box, Checkbox, FormControlLabel, FormGroup, List, ListItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Settings } from '../Settings/Settings';
import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { SettingsStore } from '../Settings/SettingsStore';
import { useTranslation } from 'react-i18next';
import { BackgroundManager } from '../Background/BackgroundManager';
import browser from 'webextension-polyfill';

interface Props {
  value: number;
  index: number;
}

function SettingsPopupInlineMenuTabPanel(props: Props) {
  const { value, index } = props;

  const [t] = useTranslation('global');
  const { sizeHandler } = useCustomStyle();

  const [settings, setSettings] = useState<Settings>(new Settings());
  const [currentUrl, setCurrentUrl] = useState<string | undefined>('Loading...');
  const [commands, setCommands] = useState<browser.Commands.Command[]>([]);

  useEffect(() => {
    getStoredSettings();
    getCommands();
  }, []);

  async function getCommands() {
    const commandList = await browser.commands.getAll();
    setCommands(commandList);
  }

  async function getStoredSettings() {
    const stored = await SettingsStore.getSettings();
    const tab = await BackgroundManager.getCurrentTab();
    const url = tab ? tab.url : undefined;
    setCurrentUrl(url);
    setSettings(stored);
  }

  const toggleShowInline = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showInlineIconAndPopupMenu = !stored.showInlineIconAndPopupMenu;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const togglePageToDoNotRunList = async () => {
    const url = currentUrl ?? '';

    if (isUrlPageIsInDoNotShowInlineMenusList(url)) {
      await removeThisPageToDoNotRunList(url);
    } else {
      await addThisPageToDoNotRunList(url);
    }
  };

  const toggleDomainToDoNotRunList = async () => {
    const url = currentUrl ?? '';

    if (isUrlIsInDoNotShowInlineMenusList(url)) {
      await removeThisDomainToDoNotRunList(url);
    } else {
      await addThisDomainToDoNotRunList(url);
    }
  };

  const toggleHideCredentialDetailsOnInlineMenu = async () => {
    const stored = await SettingsStore.getSettings();
    stored.hideCredentialDetailsOnInlineMenu = !stored.hideCredentialDetailsOnInlineMenu;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const isUrlIsInDoNotShowInlineMenusList = (url: string) => {
    return Settings.isUrlIsInDoNotShowInlineMenusList(settings, url);
  };

  const isUrlPageIsInDoNotShowInlineMenusList = (url: string) => {
    return Settings.isUrlPageIsInDoNotShowInlineMenusList(settings, url);
  };

  const prepUrlPageForDoNotRunList = (url: string) => {
    return Settings.prepUrlPageForDoNotRunList(url);
  };

  const prepUrlForDoNotRunList = (url: string) => {
    return Settings.prepUrlForDoNotRunList(url);
  };

  const removeThisDomainToDoNotRunList = async (url: string) => {
    const stored = await SettingsStore.getSettings();

    if (!stored.doNotShowInlineMenusOnDomains) {
      stored.doNotShowInlineMenusOnDomains = [];
    } else {
      const prepped = prepUrlForDoNotRunList(url);
      const index = stored.doNotShowInlineMenusOnDomains.indexOf(prepped, 0);
      if (index > -1) {
        
        stored.doNotShowInlineMenusOnDomains.splice(index, 1);
      }

      
    }

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const addThisDomainToDoNotRunList = async (url: string) => {
    const stored = await SettingsStore.getSettings();

    if (!stored.doNotShowInlineMenusOnDomains) {
      stored.doNotShowInlineMenusOnDomains = [];
    }

    stored.doNotShowInlineMenusOnDomains.push(prepUrlForDoNotRunList(url));

    

    const uniqueItems = [...new Set(stored.doNotShowInlineMenusOnDomains)];
    stored.doNotShowInlineMenusOnDomains = uniqueItems;


    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const removeThisPageToDoNotRunList = async (url: string) => {
    const stored = await SettingsStore.getSettings();
    if (!stored.doNotShowInlineMenusOnPages) {
      stored.doNotShowInlineMenusOnPages = [];
    } else {
      const prepped = prepUrlPageForDoNotRunList(url);
      const index = stored.doNotShowInlineMenusOnPages.indexOf(prepped, 0);
      if (index > -1) {
        
        stored.doNotShowInlineMenusOnPages.splice(index, 1);
      }
      
    }

    SettingsStore.setSettings(stored);
    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
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
    <TabPanel value={value} index={index}>
      <Box style={{ overflowY: 'auto', height: '350px', overflowWrap: 'anywhere' }}>
        <List sx={{ width: sizeHandler.getSettingsPopupTabPanelsWidth(), pt: 0 }}>
          <FormGroup>
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel
                control={<Checkbox checked={settings.showInlineIconAndPopupMenu} onChange={toggleShowInline} />}
                label={t('settings-popup-component.show-inline-menus')}
              />
            </ListItem>
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel
                control={<Checkbox disabled={!currentUrl} checked={isUrlIsInDoNotShowInlineMenusList(currentUrl ?? '')} onChange={toggleDomainToDoNotRunList} />}
                label={`${t('settings-popup-component.do-not-show-inline-menus-on-this-domain')} (${prepUrlForDoNotRunList(currentUrl ?? '')})`}
              />
            </ListItem>
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel
                control={<Checkbox disabled={!currentUrl} checked={isUrlPageIsInDoNotShowInlineMenusList(currentUrl ?? '')} onChange={togglePageToDoNotRunList} />}
                label={`${t('settings-popup-component.do-not-show-inline-menus-on-this-page')} (${prepUrlPageForDoNotRunList(currentUrl ?? '')})`}
              />
            </ListItem>
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel
                control={<Checkbox checked={settings.hideCredentialDetailsOnInlineMenu} onChange={toggleHideCredentialDetailsOnInlineMenu} />}
                label={t('settings-popup-component.do-not-show-credential-details-on-inline-menu')}
              />
            </ListItem>
          </FormGroup>
        </List>
      </Box>
    </TabPanel>
  );
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`vertical-tabpanel-${index}`} aria-labelledby={`vertical-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export default SettingsPopupInlineMenuTabPanel;
