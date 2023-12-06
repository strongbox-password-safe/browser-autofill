import { Typography, Box, Stack, Button, IconButton } from '@mui/material';
import React from 'react';
import { HorizontalRuleTwoTone, RocketLaunch, SensorsOff } from '@mui/icons-material';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { Utils } from '../Utils';
import { useTranslation } from 'react-i18next';

interface NotRunningPopupComponentProps {
  onRefresh: () => void;
}

function NotRunningPopupComponent({ onRefresh }: NotRunningPopupComponentProps) {
  const [t] = useTranslation('global');

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={0}
      minWidth="400px"
      sx={{ m: 2, width: 300 }}
    >
      <Box>
        <SensorsOff color="disabled" sx={{ fontSize: 60 }} />
      </Box>
      <Box>
        <Typography variant="h5" align="center" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
          {t('not-running-popup-component.title')}
        </Typography>
      </Box>
      {Utils.isMacintosh() ? (
        <>
          <Box>
            <IconButton color="primary" onClick={() => onLaunch(onRefresh)}>
              <RocketLaunch fontSize="inherit" />
            </IconButton>
            <Button onClick={() => onLaunch(onRefresh)}>{t('not-running-popup-component.launch-strongbox')}</Button>
          </Box>
          <HorizontalRuleTwoTone sx={{ width: '300px' }} />
          <Box display="block" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box>
              <Typography variant="h6" align="center" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
                {t('not-running-popup-component.troubleshooting.title')}
                <br />
                <Typography variant="body2" align="left" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
                  {t('not-running-popup-component.troubleshooting.message1')}
                  <br />
                  {t('not-running-popup-component.troubleshooting.message2')}
                  <br />
                  {t('not-running-popup-component.troubleshooting.message3')}
                  <br />
                  <p>
                    <Typography variant="caption" align="left" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
                      {t('not-running-popup-component.troubleshooting.settings-path')}
                    </Typography>
                  </p>
                </Typography>
              </Typography>
            </Box>
          </Box>
        </>
      ) : (
        <>
          <HorizontalRuleTwoTone sx={{ width: '300px' }} />
          <Typography variant="body2" align="left" sx={{ textOverflow: 'ellipsis', padding: 0, paddingTop: '13px' }}>
            {t('not-running-popup-component.message')}
          </Typography>
        </>
      )}
    </Stack>
  );
}

async function onLaunch(onRefresh: () => void) {
  await NativeAppApi.getInstance().launchStrongbox();
  onRefresh();
}

export default NotRunningPopupComponent;
