import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  List,
  ListItem,
  ListSubheader,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BackgroundManager } from '../Background/BackgroundManager';
import { Settings } from '../Settings/Settings';
import { SettingsStore } from '../Settings/SettingsStore';
import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { FontSize, LightOrDarkAppearance, Spacing } from '../Settings/Settings';
import SplitButton from './SplitButton';
import { useTranslation } from 'react-i18next';
import { getSelectedlanguage, languages, isAutoDetected } from '../Localization/config';

function SettingsPopupComponent() {
  const { fontSize } = useCustomStyle();
  const [loading, setLoading] = useState(false);
  const [t] = useTranslation('global');

  return (
    <Box>
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader" sx={{ textAlign: 'center' }}>
            {t('settings-popup-component.title')}
          </ListSubheader>
        }
        sx={{ minWidth: `${[FontSize.large, FontSize.xl].includes(fontSize) ? '500px' : '400px'}`, minHeight: '150px' }}
      >
        {loading ? '' : <VerticalTabs setLoading={setLoading}></VerticalTabs>}
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
          {t('general.app-name')} {process.env.VERSION}
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
          © {t('general.company-name')}
        </Typography>
      </Box>
      <Divider />
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function VerticalTabs(props: { setLoading: (loading: boolean) => void }) {
  const { toggleDarkMode, switchToSystemMode, setFontSize, setSpacing, fontSize } = useCustomStyle();
  const [settings, setSettings] = useState<Settings>(new Settings());
  const [currentUrl, setCurrentUrl] = useState<string | undefined>('Loading...');
  const [t, i18n] = useTranslation('global');
  const [value, setValue] = React.useState(0);

  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const [isLanguageAutoDetected, setIsLanguageAutoDetected] = useState(true);
  const [selectedAppearance, setSelectedAppearance] = useState(LightOrDarkAppearance.dark);
  const [selectedFontSize, setSelectedFontSize] = useState(FontSize.medium);
  const [selectedSpacing, setSelectedSpacing] = useState(Spacing.medium);

  useEffect(() => {
    getStoredSettings();
  }, []);

  useEffect(() => {
    getStoredSettings();
  }, [value]);

  async function getStoredSettings() {
    const stored = await SettingsStore.getSettings();

    const tab = await BackgroundManager.getCurrentTab();
    const url = tab ? tab.url : undefined;

    setCurrentUrl(url);
    props.setLoading(false);

    const lng = await getSelectedlanguage();

    if (stored.lng) {
      setIsLanguageAutoDetected(false);
    }

    setSelectedLanguage(languages.findIndex(language => lng === language));
    setSelectedAppearance(stored.lightOrDarkAppearance);
    setSelectedFontSize(stored.fontSize);
    setSelectedSpacing(stored.spacing);

    setSettings(stored);
  }

  const toggleAutoFillImmediatelyIfOnlyASingleMatch = async () => {
    const stored = await SettingsStore.getSettings();
    stored.autoFillImmediatelyIfOnlyASingleMatch = !stored.autoFillImmediatelyIfOnlyASingleMatch;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleShowInline = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showInlineIconAndPopupMenu = !stored.showInlineIconAndPopupMenu;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleAutoFillImmediatelyWithFirstMatch = async () => {
    const stored = await SettingsStore.getSettings();
    stored.autoFillImmediatelyWithFirstMatch = !stored.autoFillImmediatelyWithFirstMatch;

    SettingsStore.setSettings(stored);

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

  const togglePageToDoNotRunList = async () => {
    const url = currentUrl ?? '';

    if (isUrlPageIsInDoNotShowInlineMenusList(url)) {
      await removeThisPageToDoNotRunList(url);
    } else {
      await addThisPageToDoNotRunList(url);
    }
  };

  const toggleHideCredentialDetailsOnPopup = async () => {
    const stored = await SettingsStore.getSettings();
    stored.hideCredentialDetailsOnPopup = !stored.hideCredentialDetailsOnPopup;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleHideCredentialDetailsOnInlineMenu = async () => {
    const stored = await SettingsStore.getSettings();
    stored.hideCredentialDetailsOnInlineMenu = !stored.hideCredentialDetailsOnInlineMenu;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
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

  const prepUrlForDoNotRunList = (url: string) => {
    return Settings.prepUrlForDoNotRunList(url);
  };

  const prepUrlPageForDoNotRunList = (url: string) => {
    return Settings.prepUrlPageForDoNotRunList(url);
  };

  const isUrlIsInDoNotShowInlineMenusList = (url: string) => {
    return Settings.isUrlIsInDoNotShowInlineMenusList(settings, url);
  };

  const isUrlPageIsInDoNotShowInlineMenusList = (url: string) => {
    return Settings.isUrlPageIsInDoNotShowInlineMenusList(settings, url);
  };

  const isUrlInDoNotFillList = (url: string) => {
    return Settings.isUrlInDoNotFillList(settings, url);
  };

  const toggleShowMatchCountOnPopupBadge = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showMatchCountOnPopupBadge = !stored.showMatchCountOnPopupBadge;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const handleChangeLanguage = async (index: number) => {
    if (selectedLanguage !== index) {
      const stored = await SettingsStore.getSettings();

      if (isAutoDetected(languages[index])) {
        stored.lng = String();
        setIsLanguageAutoDetected(true);
      } else {
        stored.lng = languages[index];
        setIsLanguageAutoDetected(false);
      }

      
      setSelectedLanguage(index);
      i18n.changeLanguage(languages[index]);

      SettingsStore.setSettings(stored);
      const stored2 = await SettingsStore.getSettings();
      setSettings(stored2);
    }
  };

  const handleChangeAppearance = async (value: number) => {
    const stored = await SettingsStore.getSettings();

    stored.lightOrDarkAppearance = value;

    switch (stored.lightOrDarkAppearance) {
      case LightOrDarkAppearance.dark:
      case LightOrDarkAppearance.light:
        toggleDarkMode(stored.lightOrDarkAppearance === LightOrDarkAppearance.dark);
        break;
      case LightOrDarkAppearance.system:
        switchToSystemMode();
        break;
    }

    setSelectedAppearance(stored.lightOrDarkAppearance);
    SettingsStore.setSettings(stored);
    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const handleChangeFontSize = async (value: number) => {
    const stored = await SettingsStore.getSettings();

    stored.fontSize = value;
    setFontSize(stored.fontSize);
    setSelectedFontSize(stored.fontSize);

    SettingsStore.setSettings(stored);
    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const handleChangeSpacing = async (value: number) => {
    const stored = await SettingsStore.getSettings();

    stored.spacing = value;
    setSpacing(stored.spacing);
    setSelectedSpacing(stored.spacing);

    SettingsStore.setSettings(stored);
    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Settings tabs"
        sx={{ borderRight: 1, borderColor: 'divider', padding: 0 }}
      >
        <Tab label={t('settings-popup-component.title-tab1')} {...a11yProps(0)} />
        <Tab label={t('settings-popup-component.title-tab2')} {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <div style={{ overflowY: 'auto', height: '350px', overflowWrap: 'anywhere' }}>
          <List
            sx={{ width: `${[FontSize.large, FontSize.xl].includes(fontSize) ? '390px' : '290px'}`, paddingTop: 0 }}
          >
            <FormGroup>
              <ListItem sx={{ paddingTop: 0 }}>
                <Box sx={{ width: '350px', textAlign: 'center', padding: 0 }}>
                  <FormControl sx={{ alignItems: 'center' }}>
                    <FormLabel sx={{ paddingBottom: 1, paddingRight: 2 }}>
                      {t('settings-popup-component.language')}
                    </FormLabel>
                    <SplitButton
                      onOptionChange={handleChangeLanguage}
                      options={languages.map((lng, index) => {
                        const namesResolution = new Intl.DisplayNames([lng], { type: 'language' });

                        const languageName = namesResolution.of(lng) ?? String();
                        let selectedLanguageName = languageName;

                        if ((isLanguageAutoDetected && lng === i18n.language) || isAutoDetected(lng)) {
                          selectedLanguageName = t('autodetected-language', { language: languageName });
                        }

                        const capitalizedSelectedLanguageName =
                          selectedLanguageName.charAt(0).toUpperCase() + selectedLanguageName.slice(1);

                        return {
                          title: capitalizedSelectedLanguageName,
                          value: index,
                        };
                      })}
                      defaultValue={selectedLanguage}
                    />
                  </FormControl>
                </Box>
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={<Checkbox checked={settings.showInlineIconAndPopupMenu} onChange={toggleShowInline} />}
                  label={t('settings-popup-component.show-inline-menus')}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.showMatchCountOnPopupBadge}
                      onChange={toggleShowMatchCountOnPopupBadge}
                    />
                  }
                  label={t('settings-popup-component.show-match-count-badge-on-popup-icon')}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.autoFillImmediatelyIfOnlyASingleMatch}
                      onChange={toggleAutoFillImmediatelyIfOnlyASingleMatch}
                    />
                  }
                  label={t('settings-popup-component.fill-on-load-if-only-single-match-found')}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.autoFillImmediatelyWithFirstMatch}
                      onChange={toggleAutoFillImmediatelyWithFirstMatch}
                    />
                  }
                  label={t('settings-popup-component.always-fill-on-load-with-first-match')}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!currentUrl}
                      checked={isUrlInDoNotFillList(currentUrl ?? '')}
                      onChange={toggleDomainToDoNotFillList}
                    />
                  }
                  label={`${t('settings-popup-component.do-not-fill-on-load-on-this-domain')} (${prepUrlForDoNotRunList(
                    currentUrl ?? ''
                  )})`}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!currentUrl}
                      checked={isUrlIsInDoNotShowInlineMenusList(currentUrl ?? '')}
                      onChange={toggleDomainToDoNotRunList}
                    />
                  }
                  label={`${t(
                    'settings-popup-component.do-not-show-inline-menus-on-this-domain'
                  )} (${prepUrlForDoNotRunList(currentUrl ?? '')})`}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!currentUrl}
                      checked={isUrlPageIsInDoNotShowInlineMenusList(currentUrl ?? '')}
                      onChange={togglePageToDoNotRunList}
                    />
                  }
                  label={`${t(
                    'settings-popup-component.do-not-show-inline-menus-on-this-page'
                  )} (${prepUrlPageForDoNotRunList(currentUrl ?? '')})`}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.hideCredentialDetailsOnPopup}
                      onChange={toggleHideCredentialDetailsOnPopup}
                    />
                  }
                  label={t('settings-popup-component.do-not-show-credential-details-on-popup')}
                />
              </ListItem>
              <ListItem sx={{ padding: '2px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.hideCredentialDetailsOnInlineMenu}
                      onChange={toggleHideCredentialDetailsOnInlineMenu}
                    />
                  }
                  label={t('settings-popup-component.do-not-show-credential-details-on-inline-menu')}
                />
              </ListItem>
            </FormGroup>
          </List>
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <FormGroup>
          <List sx={{ width: `${[FontSize.large, FontSize.xl].includes(fontSize) ? '390px' : '290px'}` }}>
            <FormGroup>
              <ListItem>
                <Box sx={{ width: '350px', textAlign: 'center', padding: 0 }}>
                  <FormControl sx={{ alignItems: 'center' }}>
                    <FormLabel sx={{ paddingBottom: 1 }}>{t('settings-popup-component.appearance')}</FormLabel>
                    <SplitButton
                      onOptionChange={handleChangeAppearance}
                      options={[
                        { title: t('settings-popup-component.appearance-dark'), value: LightOrDarkAppearance.dark },
                        { title: t('settings-popup-component.appearance-light'), value: LightOrDarkAppearance.light },
                        { title: t('settings-popup-component.appearance-system'), value: LightOrDarkAppearance.system },
                      ]}
                      defaultValue={selectedAppearance}
                    />
                  </FormControl>
                </Box>
              </ListItem>
              <ListItem>
                <Box sx={{ width: '350px', textAlign: 'center', padding: 0 }}>
                  <FormControl sx={{ alignItems: 'center' }}>
                    <FormLabel sx={{ paddingBottom: 1 }}>{t('settings-popup-component.font-size')}</FormLabel>
                    <SplitButton
                      onOptionChange={handleChangeFontSize}
                      options={[
                        { title: t('settings-popup-component.style-small'), value: FontSize.small },
                        { title: t('settings-popup-component.style-medium'), value: FontSize.medium },
                        { title: t('settings-popup-component.style-large'), value: FontSize.large },
                        { title: t('settings-popup-component.style-xl'), value: FontSize.xl },
                      ]}
                      defaultValue={selectedFontSize}
                    />
                  </FormControl>
                </Box>
              </ListItem>
              <ListItem>
                <Box sx={{ width: '350px', textAlign: 'center', padding: 0 }}>
                  <FormControl sx={{ alignItems: 'center' }}>
                    <FormLabel sx={{ paddingBottom: 1 }}>{t('settings-popup-component.spacing')}</FormLabel>
                    <SplitButton
                      onOptionChange={handleChangeSpacing}
                      options={[
                        { title: t('settings-popup-component.style-small'), value: Spacing.small },
                        { title: t('settings-popup-component.style-medium'), value: Spacing.medium },
                        { title: t('settings-popup-component.style-large'), value: Spacing.large },
                      ]}
                      defaultValue={selectedSpacing}
                    />
                  </FormControl>
                </Box>
              </ListItem>
            </FormGroup>
          </List>
        </FormGroup>
      </TabPanel>
    </Box>
  );
}

export default SettingsPopupComponent;
