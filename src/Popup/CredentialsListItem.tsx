import * as React from 'react';
import Typography from '@mui/material/Typography';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import Box from '@mui/system/Box';
import { AvTimer, Key, Person } from '@mui/icons-material';
import { IconButton, Paper, Tooltip } from '@mui/material';
import * as OTPAuth from 'otpauth';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { WellKnownField } from '../Messaging/Protocol/WellKnownField';

interface CredentialListItemProps {
  credential: AutoFillCredential;
  showToast: (message: string) => void;
}

export default function CredentialsListItem({
  credential,
  showToast,
}: CredentialListItemProps) {
  const onCopyUsername = () => {
    NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.username);
    showToast('Username Copied');
  };
  const onCopyPassword = () => {
    NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.password);
    showToast('Password Copied');
  };
  const onCopyTotp = () => {
    NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.totp, true);
    showToast('TOTP Copied');
  };

  let currentTotpCode = getCurrentTotpCode();

  if (currentTotpCode.length > 0) {
    const middle = Math.floor(currentTotpCode.length / 2);
    if (middle > 0) {
      currentTotpCode =
        currentTotpCode.substring(0, middle) +
        '-' +
        currentTotpCode.substring(middle);
    }
  }

  function getCurrentTotpCode(): string {
    if (credential.totp.length > 0) {
      try {
        const parsedTotp = OTPAuth.URI.parse(credential.totp);
        return parsedTotp.generate();
      } catch (error) {
      }
    }

    return '';
  }

  return (
    <Paper elevation={18}>
      <Box
        display="flex"
        sx={{
          m: '5px',
          p: '5px',
          width: '100%',
          height: '100%',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            alignContent: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <Box
            component="img"
            display="block"
            sx={{
              height: 32,
              width: 37,
              margin: 'auto',
              paddingLeft: '5px',
              marginRight: '12px'
            }}
            alt="Icon"
            src={credential.icon}
          />
        </Box>
        <Box
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            width: '215px',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {credential.favourite ? '⭐️ ' : ''}{credential.title}
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
                marginTop: '0px',
                padding: 0,
              }}
            >
              {credential.username}
            </Typography>
            {/* <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace' }}
            display="inline"
          >
            | 038523
          </Typography> */}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignContent="center">
          <Box
            display="flex"
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              width: '115px',
              overflow: 'hidden',
              justifyContent: 'flex-end',
              alignContent: 'center',
            }}
          >
            <Tooltip title="Copy Username">
              <span>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCopyUsername();
                  }}
                >
                  <Person fontSize="inherit" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Copy Password">
              <span>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCopyPassword();
                  }}
                >
                  <Key fontSize="inherit" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Copy TOTP">
              <span>
                <IconButton
                  size="small"
                  disabled={currentTotpCode == ''}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCopyTotp();
                  }}
                >
                  <AvTimer fontSize="inherit" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          {currentTotpCode == '' ? (
            ''
          ) : (
            <Box justifyContent="flex-end">
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', paddingRight: '5px' }}
                align="right"
              >
                {currentTotpCode}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
