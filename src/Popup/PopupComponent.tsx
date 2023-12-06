import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import browser from 'webextension-polyfill';


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import CurrentTabCredentialsComponent from './CurrentTabCredentials';

import { Snackbar, Alert, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import NotRunningPopupComponent from './NotRunningPopupComponent';
import { Storage, DomainVerification, Settings } from '@mui/icons-material';
import DatabasesListPopupComponent from './DatabasesListPopupComponent';
import SettingsPopupComponent from './SettingsPopupComponent';
import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { useTranslation } from 'react-i18next';
import { Utils } from '../Utils';
import { FontSize } from '../Settings/Settings';

enum Tabs {
  Credentials = 0,
  Databases,
  Settings,
}

export default function PopupComponent() {
  const [t] = useTranslation('global');
  const { getCustomStyle, fontSize } = useCustomStyle();
  const theme = createTheme(getCustomStyle());

  const ref = React.useRef<HTMLDivElement>(null); 

  const [loading, setLoading] = React.useState<boolean>(true);
  const [unlockedCount, setUnlockedCount] = React.useState(0);

  const [error, setError] = React.useState<boolean>(false);

  const [selectedTab, setSelectedTab] = React.useState(Tabs.Databases);

  const [popupVisible, setPopupVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setPopupVisible(true);
  };

  const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setPopupVisible(false);
  };

  const onDismiss = () => {
    
    
    window.close();
  };

  React.useEffect(() => {
    async function getCurrentStatus() {

      const status = await NativeAppApi.getInstance().getStatus();

      if (status != null) {
        

        const unlocked = status.databases.filter(database => !database.locked && database.autoFillEnabled);

        setUnlockedCount(unlocked.length);
        setSelectedTab(unlocked.length == 0 ? Tabs.Databases : Tabs.Credentials);
      } else {
        setError(true);
      }

      setLoading(false);
    }

    getCurrentStatus().catch(() => {
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ overflow: 'hidden', scrollbarWidth: 'none' }} ref={ref}>
        <CssBaseline />
        <Box>
          {loading ? (
            t('general.loading')
          ) : selectedTab > Tabs.Credentials ? (
            selectedTab == Tabs.Databases ? (
              error ? (
                <NotRunningPopupComponent onRefresh={onDismiss} />
              ) : (
                <DatabasesListPopupComponent showToast={message => showToast(message)} />
              )
            ) : (
              <SettingsPopupComponent />
            )
          ) : (
            <CurrentTabCredentialsComponent showToast={message => showToast(message)} />
          )}
        </Box>
        <Snackbar open={popupVisible} autoHideDuration={1000} onClose={handleToastClose}>
          <Alert onClose={handleToastClose} severity="success" sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>

        {Utils.isMacintosh() && (
          <Paper
            elevation={1}
            square
            sx={{ boxShadow: 'none', margin: `${[FontSize.xl, FontSize.large].includes(fontSize) ? '10px' : '0px'}` }}
          >
            <BottomNavigation
              showLabels
              value={selectedTab}
              onChange={(_event, newValue) => {
                setSelectedTab(newValue);
              }}
            >
              {unlockedCount === 0 || error ? (
                ''
              ) : (
                <BottomNavigationAction
                  label={unlockedCount === 0 ? '' : t('current-tab-credentials.title')}
                  icon={<DomainVerification color={selectedTab == Tabs.Credentials ? 'primary' : 'disabled'} />}
                />
              )}
              <BottomNavigationAction
                label={t('databases-list-popup-component.title')}
                icon={<Storage color={selectedTab == Tabs.Databases ? 'primary' : 'disabled'} />}
              />

              <BottomNavigationAction
                label={t('settings-popup-component.title')}
                icon={<Settings color={selectedTab == Tabs.Settings ? 'primary' : 'disabled'} />}
              />
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
