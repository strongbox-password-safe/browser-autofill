import { Typography, Box, Stack, Button, IconButton, ListItem, List } from '@mui/material';
import React from 'react';
import { HorizontalRule, HorizontalRuleTwoTone, Person, RocketLaunch, SensorsOff } from '@mui/icons-material';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { Utils } from '../Utils';

interface NotRunningPopupComponentProps {
  onRefresh: () => void;
}

function NotRunningPopupComponent({ onRefresh }: NotRunningPopupComponentProps) {
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
          Strongbox Unavailable
        </Typography>
      </Box>
      {Utils.isMacintosh() ? (
        <>
          <Box>
            <IconButton color="primary" onClick={() => onLaunch(onRefresh)}>
              <RocketLaunch fontSize="inherit" />
            </IconButton>
            <Button onClick={() => onLaunch(onRefresh)}>Launch Strongbox</Button>
          </Box>
          <HorizontalRuleTwoTone sx={{ width: '300px' }} />
          <Box display="block" sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box>
              <Typography variant="h6" align="center" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
                Troubleshooting
                <br />
                <Typography variant="body2" align="left" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
                  1. Make sure Strongbox is installed and running.
                  <br />
                  2. Make sure you are a Pro user, AutoFill is a paid Pro feature.
                  <br />
                  3. Check the setting below is enabled:
                  <br />
                  <p>
                    <Typography variant="caption" align="left" sx={{ textOverflow: 'ellipsis', padding: 0 }}>
                      Settings {'>'} Advanced {'>'} Chrome & Firefox AutoFill Extension
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
            Unfortunately Strongbox isn't yet available on this platform.
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
