import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { Box, Button, IconButton, Menu, Typography } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';

export function InlineMenuCredentialItem(
  credential: AutoFillCredential,
  handleCredentialClick: (credential: AutoFillCredential) => void,
  handleCopyUsername: (credential: AutoFillCredential) => void,
  handleCopyPassword: (credential: AutoFillCredential) => void,
  handleCopyTotp: (credential: AutoFillCredential) => void,
  credentialsAreFromMultipleDatabases: () => boolean
): JSX.Element {
  function getCurrentTotpCode(credential: AutoFillCredential, formatted = true): string {
    return AutoFillCredential.getCurrentTotpCode(credential, formatted);
  }

  const handleMoreButtonClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
    event.preventDefault();
  };

  const onCopyUsername = (event: any) => {
    handleCopyUsername(credential);
    setAnchorEl(null);
    event.stopPropagation();
    event.preventDefault();
  };
  const onCopyPassword = (event: any) => {
    handleCopyPassword(credential);
    setAnchorEl(null);
    event.stopPropagation();
    event.preventDefault();
  };
  const onCopyTotp = (event: any) => {
    handleCopyTotp(credential);
    event.stopPropagation();
    event.preventDefault();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <MenuItem
      key={credential.uuid}
      onClick={() => {
        handleCredentialClick(credential);
      }}
    >
      <Box sx={{ display: 'flex', gap: '12px', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
        <Box sx={{ flexShrink: 1 }}>
          <Box
            component="img"
            display="block"
            sx={{
              height: 32,
              width: 32,
              borderRadius: '5px',
            }}
            alt="Icon"
            src={credential.icon}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: '0px', flexDirection: 'column', flexGrow: 1, minWidth: '200px' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ pb: 0, mb: 0, textAlign: 'left' }} variant="body1">
              {credential.title}
            </Typography>
            <Box
              sx={{ display: 'flex', flexDirection: 'row', gap: '1px', justifyItems: 'center', alignItems: 'center' }}
            >
              {credential.totp.length > 0 ? (
                <Button size="small" onClick={onCopyTotp}>
                  <Typography sx={{ pb: 0, mb: 0, textAlign: 'left' }} variant="caption">
                    {getCurrentTotpCode(credential)}
                  </Typography>
                </Button>
              ) : (
                ''
              )}
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{ zIndex: '2147483642' }}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={onCopyUsername}>Copy Username</MenuItem>
                <MenuItem onClick={onCopyPassword}>Copy Password</MenuItem>
              </Menu>
              <IconButton size="small" onClick={handleMoreButtonClick}>
                <MoreHoriz fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
            <Typography sx={{ color: 'text.secondary' }} variant="body2">
              {credential.username}
            </Typography>
            {credentialsAreFromMultipleDatabases() ? (
              <Typography sx={{ color: 'text.disabled' }} variant="body2">
                {credential.databaseName}
              </Typography>
            ) : (
              ''
            )}
          </Box>
        </Box>
      </Box>
    </MenuItem>
  );
}
