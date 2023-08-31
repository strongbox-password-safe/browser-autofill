import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListSubheader,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BackgroundManager } from '../Background/BackgroundManager';
import { Settings } from '../Settings/Settings';
import { SettingsStore } from '../Settings/SettingsStore';

function SettingsPopupComponent() {
  const [settings, setSettings] = useState<Settings>(new Settings());
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>('Loading...');

  useEffect(() => {
    async function getStoredSettings() {
      const stored = await SettingsStore.getSettings();
      setSettings(stored);

      const tab = await BackgroundManager.getCurrentTab();
      const url = tab ? tab.url : undefined;

      setCurrentUrl(url);
      setLoading(false);
    }

    getStoredSettings();
  }, []);

  const toggleAutoFillImmediatelyIfOnlyASingleMatch = async () => {
    const stored = await SettingsStore.getSettings();
    stored.autoFillImmediatelyIfOnlyASingleMatch = !stored.autoFillImmediatelyIfOnlyASingleMatch;

    await SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleShowInline = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showInlineIconAndPopupMenu = !stored.showInlineIconAndPopupMenu;

    await SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleAutoFillImmediatelyWithFirstMatch = async () => {
    const stored = await SettingsStore.getSettings();
    stored.autoFillImmediatelyWithFirstMatch = !stored.autoFillImmediatelyWithFirstMatch;

    await SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleDomainToDoNotRunList = async () => {
    const url = currentUrl ?? '';

    if (isUrlIsInDoNotShowInlineMenusList(url)) {
      await removeThisDomainToDoNotRunList(url);
    } else {
      await addThisDomainToDoNotRunList(url);
    }
  };

  const toggleDomainToDoNotFillList = async () => {
    const url = currentUrl ?? '';

    if (isUrlInDoNotFillList(url)) {
      await removeThisDomainToDoNotFillList(url);
    } else {
      await addThisDomainToDoNotFillList(url);
    }
  };

  const removeThisDomainToDoNotFillList = async (url: string) => {
    const stored = await SettingsStore.getSettings();

    if (!stored.doNotFillOnDomains) {
      stored.doNotFillOnDomains = [];
    } else {
      const prepped = prepUrlForDoNotRunList(url);
      const index = stored.doNotFillOnDomains.indexOf(prepped, 0);
      if (index > -1) {
        
        stored.doNotFillOnDomains.splice(index, 1);
      }

      
    }

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
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

    await SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const addThisDomainToDoNotFillList = async (url: string) => {
    const stored = await SettingsStore.getSettings();

    if (!stored.doNotFillOnDomains) {
      stored.doNotFillOnDomains = [];
    }

    stored.doNotFillOnDomains.push(prepUrlForDoNotRunList(url));

    

    const uniqueItems = [...new Set(stored.doNotFillOnDomains)];
    stored.doNotFillOnDomains = uniqueItems;


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


    await SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const prepUrlForDoNotRunList = (url: string) => {
    return Settings.prepUrlForDoNotRunList(url);
  };

  const isUrlIsInDoNotShowInlineMenusList = (url: string) => {
    return Settings.isUrlIsInDoNotShowInlineMenusList(settings, url);
  };

  const isUrlInDoNotFillList = (url: string) => {
    return Settings.isUrlInDoNotFillList(settings, url);
  };

  

  const toggleShowMatchCountOnPopupBadge = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showMatchCountOnPopupBadge = !stored.showMatchCountOnPopupBadge;

    await SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  return (
    <Box>
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader" sx={{ textAlign: 'center' }}>
            Settings
          </ListSubheader>
        }
        sx={{ minWidth: '400px', minHeight: '150px' }}
      >
        {loading ? (
          ''
        ) : (
          <FormGroup>
            <ListItem>
              <FormControlLabel
                control={<Checkbox checked={settings.showInlineIconAndPopupMenu} onChange={toggleShowInline} />}
                label="Show Inline Menus"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Checkbox checked={settings.showMatchCountOnPopupBadge} onChange={toggleShowMatchCountOnPopupBadge} />
                }
                label="Show Match Count Badge on Popup Icon"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.autoFillImmediatelyIfOnlyASingleMatch}
                    onChange={toggleAutoFillImmediatelyIfOnlyASingleMatch}
                  />
                }
                label="Fill on Load if Only Single Match Found"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.autoFillImmediatelyWithFirstMatch}
                    onChange={toggleAutoFillImmediatelyWithFirstMatch}
                  />
                }
                label="Always Fill on Load with First Match"
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={!currentUrl}
                    checked={isUrlInDoNotFillList(currentUrl ?? '')}
                    onChange={toggleDomainToDoNotFillList}
                  />
                }
                label={'Do Not Fill on this Domain (' + prepUrlForDoNotRunList(currentUrl ?? '') + ')'}
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={!currentUrl}
                    checked={isUrlIsInDoNotShowInlineMenusList(currentUrl ?? '')}
                    onChange={toggleDomainToDoNotRunList}
                  />
                }
                label={'Hide Inline Menus on this Domain (' + prepUrlForDoNotRunList(currentUrl ?? '') + ')'}
              />
            </ListItem>
          </FormGroup>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Typography
          variant="body2"
          align="center"
          color="text.primary"
          sx={{
            textOverflow: 'ellipsis',
            padding: '5px',
          }}
        >
          Strongbox AutoFill {process.env.VERSION}
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{
            textOverflow: 'ellipsis',
            padding: '5px',
            textAlign: 'center',
          }}
        >
          © Phoebe Code Limited
        </Typography>
      </Box>
      <Divider />
    </Box>
  );
}

export default SettingsPopupComponent;
