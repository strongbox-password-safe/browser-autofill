import { Box, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, List, ListItem, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SplitButton from './SplitButton';
import { Settings } from '../Settings/Settings';
import { FontSize, useCustomStyle } from '../Contexts/CustomStyleContext';
import { SettingsStore } from '../Settings/SettingsStore';
import { useTranslation } from 'react-i18next';
import { getSelectedlanguage, languages, isAutoDetected } from '../Localization/config';
import browser from 'webextension-polyfill';
import KeyboardIcon from '@mui/icons-material/Keyboard';

interface Props {
  value: number;
  index: number;
}

function SettingsPopupGeneralTabPanel(props: Props) {
  const { value, index } = props;

  const [t, i18n] = useTranslation('global');
  const { fontSize, sizeHandler } = useCustomStyle();
  const [settings, setSettings] = useState<Settings>(new Settings());
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const [isLanguageAutoDetected, setIsLanguageAutoDetected] = useState(true);
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
    const lng = await getSelectedlanguage();

    if (stored.lng) {
      setIsLanguageAutoDetected(false);
    }

    setSelectedLanguage(languages.findIndex(language => lng === language));
    setSettings(stored);
  }

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
    }
  };

  const toggleShowMatchCountOnPopupBadge = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showMatchCountOnPopupBadge = !stored.showMatchCountOnPopupBadge;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleHideCredentialDetailsOnPopup = async () => {
    const stored = await SettingsStore.getSettings();
    stored.hideCredentialDetailsOnPopup = !stored.hideCredentialDetailsOnPopup;

    SettingsStore.setSettings(stored);

    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  const toggleShowScrollbars = async () => {
    const stored = await SettingsStore.getSettings();
    stored.showScrollbars = !stored.showScrollbars;
    SettingsStore.setSettings(stored);
    const stored2 = await SettingsStore.getSettings();
    setSettings(stored2);
  };

  return (
    <TabPanel value={value} index={index}>
      <Box style={{ overflowY: 'auto', height: '350px', overflowWrap: 'anywhere' }}>
        <List sx={{ width: sizeHandler.getSettingsPopupTabPanelsWidth(), pt: 0 }}>
          <FormGroup>
            <ListItem sx={{ pt: 0 }}>
              <Box sx={{ width: '350px', textAlign: 'center', p: 0 }}>
                <FormControl sx={{ alignItems: 'center' }}>
                  <FormLabel sx={{ pb: 1, pr: 2 }}>{t('settings-popup-component.language')}</FormLabel>
                  <SplitButton
                    onOptionChange={handleChangeLanguage}
                    options={languages.map((lng, index) => {
                      const namesResolution = new Intl.DisplayNames([lng], { type: 'language' });

                      const languageName = namesResolution.of(lng) ?? String();
                      let selectedLanguageName = languageName;

                      if ((isLanguageAutoDetected && lng === i18n.language) || isAutoDetected(lng)) {
                        selectedLanguageName = t('autodetected-language', { language: languageName });
                      }

                      const capitalizedSelectedLanguageName = selectedLanguageName.charAt(0).toUpperCase() + selectedLanguageName.slice(1);

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
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel
                control={<Checkbox checked={settings.showMatchCountOnPopupBadge} onChange={toggleShowMatchCountOnPopupBadge} />}
                label={t('settings-popup-component.show-match-count-badge-on-popup-icon')}
              />
            </ListItem>
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel
                control={<Checkbox checked={settings.hideCredentialDetailsOnPopup} onChange={toggleHideCredentialDetailsOnPopup} />}
                label={t('settings-popup-component.do-not-show-credential-details-on-popup')}
              />
            </ListItem>
            <ListItem sx={{ p: '2px' }}>
              <FormControlLabel control={<Checkbox checked={settings.showScrollbars} onChange={toggleShowScrollbars} />} label={t('settings-popup-component.show-scrollbars')} />
            </ListItem>
          </FormGroup>
        </List>
        {commands.filter(x => x.shortcut).length != 0 && (
          <Box sx={{ pt: 4, pl: 0.5, position: fontSize !== FontSize.xl ? 'absolute' : '', bottom: 10 }}>
            <Box sx={{ width: '350px', textAlign: 'left', p: 0 }}>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <KeyboardIcon sx={{ fontSize: sizeHandler.getBottomToolbarIconSize() }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'left', cursor: 'pointer' }}>
                  <Typography color="text.secondary" variant="body1" align="left" sx={{ pt: 0, pb: 0, pl: '2px', fontWeight: 'bold' }}>
                    {t('shortcuts.title')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {commands
              .filter(x => x.shortcut)
              .map(command => (
                <Box key={command.name} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography color="text.secondary" variant="body2" sx={{ marginRight: 1 }}>
                    {`${t(`shortcuts.${command.name}`)}:`}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 'bolder' }}>
                    {`${command.shortcut}`}
                  </Typography>
                </Box>
              ))}
          </Box>
        )}
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

export default SettingsPopupGeneralTabPanel;
