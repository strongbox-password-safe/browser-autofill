import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import browser from 'webextension-polyfill';


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CurrentTabCredentialsComponent from './CurrentTabCredentials';

import { Snackbar, Alert, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import NotRunningPopupComponent from './NotRunningPopupComponent';
import { Storage, DomainVerification, Settings } from '@mui/icons-material';
import DatabasesListPopupComponent from './DatabasesListPopupComponent';
import SettingsPopupComponent from './SettingsPopupComponent';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

export default function PopupComponent() {
  const ref = React.useRef<HTMLDivElement>(null); 

  const [loading, setLoading] = React.useState<boolean>(true);
  const [unlockedCount, setUnlockedCount] = React.useState(0);

  const [error, setError] = React.useState<boolean>(false);

  const [selectedTab, setSelectedTab] = React.useState(1);

  const [popupVisible, setPopupVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setPopupVisible(true);
  };

  const handleToastClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
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
        

        const unlocked = status.databases.filter((database) => !database.locked && database.autoFillEnabled);

        setUnlockedCount(unlocked.length);
        setSelectedTab(unlocked.length == 0 ? 1 : 0);

      }
      else {
        setError(true);
      }

      setLoading(false);
    }

    getCurrentStatus().catch(() => {
    });
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ overflow: 'hidden', scrollbarWidth: 'none' }} ref={ref}>
        <CssBaseline />
        {loading ? (
          'Loading...'
        ) : error ? (
          <NotRunningPopupComponent onRefresh={onDismiss} />
        ) : selectedTab > 0 ? (
          selectedTab == 1 ? (
            <DatabasesListPopupComponent showToast={(message) => showToast(message)} />) : (<SettingsPopupComponent />)
        ) : (
          <CurrentTabCredentialsComponent
            showToast={(message) => showToast(message)}
          />
        )}

        <Snackbar open={popupVisible} autoHideDuration={1000} onClose={handleToastClose}>
          <Alert
            onClose={handleToastClose}
            severity="success"
            sx={{ width: '100%' }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>

        <Paper
          elevation={1}
          square
        >
          <BottomNavigation
            showLabels
            value={selectedTab}
            onChange={(_event, newValue) => {
              setSelectedTab(newValue);
            }}
          >
            {unlockedCount === 0 ? '' : <BottomNavigationAction label={unlockedCount === 0 ? '' : 'Matches'} icon={<DomainVerification color={selectedTab == 0 ? 'primary' : 'disabled'} />} />}
            <BottomNavigationAction label="Databases" icon={<Storage color={selectedTab == 1 ? 'primary' : 'disabled'} />} />
            {error ? ('') : (<BottomNavigationAction label="Settings" icon={<Settings color={selectedTab == 2 ? 'primary' : 'disabled'} />} />)}
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider >
  );
}