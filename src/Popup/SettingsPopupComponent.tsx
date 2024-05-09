import { Box, Divider, List, ListSubheader, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';

import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { useTranslation } from 'react-i18next';
import SettingsPopupStyleTabPanel from './SettingsPopupStyleTabPanel';
import SettingsPopupGeneralTabPanel from './SettingsPopupGeneralTabPanel';
import SettingsPopupFillTabPanel from './SettingsPopupFillTabPanel';
import SettingsPopupInlineMenuTabPanel from './SettingsPopupInlineMenuTabPanel';

function SettingsPopupComponent() {
  const { sizeHandler } = useCustomStyle();
  const [loading, setLoading] = useState(false);
  const [t] = useTranslation('global');

  return (
    <Box>
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader" sx={{ textAlign: 'center' }}>
            <Box sx={{ p: 1.5 }}>
              <Box sx={{ lineHeight: 1.1 }}>
                {t('settings-popup-component.title')}

                <br />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textOverflow: 'ellipsis',
                  }}
                >
                  {`${t('general.version')} ${process.env.VERSION}`}
                </Typography>
              </Box>
            </Box>
          </ListSubheader>
        }
        sx={{ minWidth: sizeHandler.getSettingsPopupListMinWidth(), minHeight: '150px' }}
      >
        {!loading && <VerticalTabs />}
      </List>
      <Divider />
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function VerticalTabs() {
  const [t] = useTranslation('global');
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
      <Tabs orientation="vertical" variant="scrollable" value={value} onChange={handleChange} aria-label="Settings tabs" sx={{ borderRight: 1, borderColor: 'divider', p: 0 }}>
        <Tab label={t('settings-popup-component.title-tab1')} {...a11yProps(0)} />
        <Tab label={t('settings-popup-component.title-tab2')} {...a11yProps(1)} />
        <Tab label={t('settings-popup-component.title-tab3')} {...a11yProps(2)} />
        <Tab label={t('settings-popup-component.title-tab4')} {...a11yProps(3)} />
      </Tabs>

      <SettingsPopupGeneralTabPanel value={value} index={0} />
      <SettingsPopupFillTabPanel value={value} index={1} />
      <SettingsPopupInlineMenuTabPanel value={value} index={2} />
      <SettingsPopupStyleTabPanel value={value} index={3} />
    </Box>
  );
}

export default SettingsPopupComponent;
