import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { Lock, LockOpen } from '@mui/icons-material';
import { Button, Paper } from '@mui/material';
import { DatabaseSummary } from '../Messaging/Protocol/DatabaseSummary';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { BackgroundManager } from '../Background/BackgroundManager';
import { useTranslation } from 'react-i18next';

interface DatabaseListItemProps {
  database: DatabaseSummary;
  showToast: (message: string) => void;
}

export default function DatabaseListItem({ database }: DatabaseListItemProps) {
  const [t] = useTranslation('global');

  const onUnlock = async (database: DatabaseSummary) => {
    await NativeAppApi.getInstance().unlockDatabase(database.uuid);
    await BackgroundManager.getInstance().restoreFocus();
    window.close();
  };
  const onLock = async (database: DatabaseSummary) => {
    await NativeAppApi.getInstance().lockDatabase(database.uuid);
    await BackgroundManager.getInstance().restoreFocus();
    window.close();
  };

  return (
    <Paper elevation={18}>
      <Box
        display="flex"
        sx={{
          m: '5px',
          p: 1,
          width: '100%',
          height: '100%',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            flexGrow: 0,
            alignContent: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <Box display="flex" flexDirection="column" alignContent="center">
            {database.autoFillEnabled ? (
              database.locked ? (
                <Lock fontSize="medium" color="error" />
              ) : (
                <LockOpen fontSize="medium" color="success" />
              )
            ) : (
              <Lock fontSize="medium" color="disabled" />
            )}
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          sx={{
            p: '0',
            ml: 1,
          }}
        >
          <Box>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {database.nickName}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              display="inline"
              color="text.secondary"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {database.autoFillEnabled ? (database.locked ? t('database-list-item.locked') : t('database-list-item.unlocked')) : t('autofill-not-enabled')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ml: 2, mr: 1 }}>
          {database.autoFillEnabled ? (
            database.locked ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  onUnlock(database);
                }}
              >
                {t('database-list-item.unlock')}
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  onLock(database);
                }}
              >
                {t('database-list-item.lock')}
              </Button>
            )
          ) : (
            ''
          )}
        </Box>
      </Box>
    </Paper>
  );
}
