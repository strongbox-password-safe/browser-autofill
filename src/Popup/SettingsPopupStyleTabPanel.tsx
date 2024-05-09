import { Box, FormControl, FormGroup, FormLabel, List, ListItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SplitButton from './SplitButton';
import { FontSize, LightOrDarkAppearance, Spacing } from '../Contexts/CustomStyleContext';
import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { SettingsStore } from '../Settings/SettingsStore';
import { useTranslation } from 'react-i18next';

interface Props {
  value: number;
  index: number;
}

function SettingsPopupStyleTabPanel(props: Props) {
  const { value, index } = props;

  const [t] = useTranslation('global');
  const { toggleDarkMode, switchToSystemMode, setFontSize, setSpacing, fontSize } = useCustomStyle();
  const [selectedAppearance, setSelectedAppearance] = useState(LightOrDarkAppearance.dark);
  const [selectedFontSize, setSelectedFontSize] = useState(FontSize.medium);
  const [selectedSpacing, setSelectedSpacing] = useState(Spacing.medium);

  useEffect(() => {
    getStoredSettings();
  }, []);

  async function getStoredSettings() {
    const stored = await SettingsStore.getSettings();
    setSelectedAppearance(stored.lightOrDarkAppearance);
    setSelectedFontSize(stored.fontSize);
    setSelectedSpacing(stored.spacing);
  }

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
  };

  const handleChangeFontSize = async (value: number) => {
    const stored = await SettingsStore.getSettings();

    stored.fontSize = value;
    setFontSize(stored.fontSize);
    setSelectedFontSize(stored.fontSize);

    SettingsStore.setSettings(stored);
  };

  const handleChangeSpacing = async (value: number) => {
    const stored = await SettingsStore.getSettings();

    stored.spacing = value;
    setSpacing(stored.spacing);
    setSelectedSpacing(stored.spacing);

    SettingsStore.setSettings(stored);
  };

  return (
    <TabPanel value={value} index={index}>
      <FormGroup>
        <List sx={{ width: `${[FontSize.large, FontSize.xl].includes(fontSize) ? '390px' : '290px'}` }}>
          <FormGroup>
            <ListItem>
              <Box sx={{ width: '350px', textAlign: 'center', p: 0 }}>
                <FormControl sx={{ alignItems: 'center' }}>
                  <FormLabel sx={{ pb: 1 }}>{t('settings-popup-component.appearance')}</FormLabel>
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
              <Box sx={{ width: '350px', textAlign: 'center', p: 0 }}>
                <FormControl sx={{ alignItems: 'center' }}>
                  <FormLabel sx={{ pb: 1 }}>{t('settings-popup-component.font-size')}</FormLabel>
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
              <Box sx={{ width: '350px', textAlign: 'center', p: 0 }}>
                <FormControl sx={{ alignItems: 'center' }}>
                  <FormLabel sx={{ pb: 1 }}>{t('settings-popup-component.spacing')}</FormLabel>
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

export default SettingsPopupStyleTabPanel;
