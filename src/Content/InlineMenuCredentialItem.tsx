import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { Badge, MoreHoriz } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, Menu, Typography } from '@mui/material';
import { GetIconResponse } from '../Messaging/Protocol/GetIconResponse';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import CredentialDetails from '../Popup/CredentialDetails';
import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import { FontSize, Settings } from '../Settings/Settings';
import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { SettingsStore } from '../Settings/SettingsStore';
import { useTranslation } from 'react-i18next';

interface InlineMenuCredentialItemProps {
  status: GetStatusResponse | null;
  credential: AutoFillCredential;
  onFillSingleField: (text: string) => Promise<void>;
  handleCredentialClick: (credential: AutoFillCredential) => void;
  handleCopyUsername: (credential: AutoFillCredential, notifyAction?: boolean) => void;
  handleCopyPassword: (credential: AutoFillCredential, notifyAction?: boolean) => void;
  handleCopyTotp: (credential: AutoFillCredential, notifyAction?: boolean) => void;
  onCopy: (text: string) => Promise<boolean>;
  onRedirectUrl: (url: string) => void;
  notifyAction: (message: string) => void;
  credentialsAreFromMultipleDatabases: () => boolean;
  getIcon: (databaseId: string, nodeId: string) => Promise<GetIconResponse | null>;
  beforeOpenSubMenu: (showDetails: boolean, restoreIframeSize?: boolean) => void;
}

export function InlineMenuCredentialItem(props: InlineMenuCredentialItemProps): JSX.Element {
  const {
    status,
    credential,
    onFillSingleField,
    handleCredentialClick,
    handleCopyUsername,
    handleCopyPassword,
    onCopy,
    onRedirectUrl,
    handleCopyTotp,
    credentialsAreFromMultipleDatabases,
    beforeOpenSubMenu,
  } = props;
  const { fontSize } = useCustomStyle();
  const [icon, setIcon] = React.useState(credential.icon);
  const [loadingIcon, setLoadingIcon] = React.useState(true);
  const [anchorElDetails, setAnchorElDetails] = React.useState<null | HTMLElement>(null);
  const [openDetailsMenu, setOpenDetailsMenu] = React.useState(false);
  const [settings, setSettings] = React.useState<Settings>(new Settings());
  const [t] = useTranslation('global');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    const getStoredSettings = async () => {
      const stored = await SettingsStore.getSettings();
      setSettings(stored);
    };

    const getIcon = async () => {
      if (!icon) {
        const iconResponse = await props.getIcon(credential.databaseId, credential.uuid);

        if (iconResponse) {
          setIcon(iconResponse.icon);
        }
      }

      getStoredSettings();
      setLoadingIcon(false);
    };

    getIcon();
  }, []);

  React.useEffect(() => {
    setAnchorEl(null);
  }, [credential]);

  function getCurrentTotpCode(credential: AutoFillCredential, formatted = true): string {
    return AutoFillCredential.getCurrentTotpCode(credential, formatted);
  }

  const handleDetailsButtonClick = (event: any) => {
    if (!settings.hideCredentialDetailsOnInlineMenu) {
      beforeOpenSubMenu(true);
      setAnchorElDetails(event.currentTarget);

      setTimeout(() => {
        setOpenDetailsMenu(true);
      }, 50);
    } else {
      
    }

    event.stopPropagation();
    event.preventDefault();
  };

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

  const handleCloseDetails = () => {
    setAnchorElDetails(null);
    setOpenDetailsMenu(false);
    beforeOpenSubMenu(true, true);
  };

  const getMarginRight = () => {
    if (!settings.hideCredentialDetailsOnInlineMenu) {
      return [FontSize.xl].includes(fontSize) ? '43px' : [FontSize.large].includes(fontSize) ? '35px' : '25px';
    }

    return '10px';
  };

  return (
    <MenuItem
      selected={anchorElDetails !== null}
      key={credential.uuid}
      onClick={() => {
        handleCredentialClick(credential);
      }}
      sx={{ p: `7.5px ${getMarginRight()} 7px 8px` }}
    >
      <Box sx={{ display: 'flex', gap: '0px', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
        <Box sx={{ flexShrink: 1, pl: '5px' }}>
          {loadingIcon ? (
            <Box
              display="block"
              sx={{
                width: 15,
                margin: 'auto',
                paddingLeft: '5px',
                marginRight: '12px',
              }}
            >
              <CircularProgress style={{ color: 'gray' }} size={20} />
            </Box>
          ) : icon ? (
            <Box
              component="img"
              display="block"
              sx={{
                height: 32,
                width: 32,
                borderRadius: '5px',
              }}
              alt="Icon"
              src={icon}
            />
          ) : (
            <Box
              display="block"
              sx={{
                width: 15,
                margin: 'auto',
                paddingLeft: '5px',
                marginRight: '12px',
              }}
            >
              <Badge fontSize="medium" />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: '0px',
            flexDirection: 'column',
            flexGrow: 1,
            width: 0,
            ml: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0px',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                pb: 0,
                mb: 0,
                textAlign: 'left',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                mr: !settings.hideCredentialDetailsOnInlineMenu ? 0 : 2,
                textOverflow: `${!settings.hideCredentialDetailsOnInlineMenu ? 'ellipsis' : 'none'}`,
              }}
              variant="body1"
            >
              {credential.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1px',
                justifyItems: 'center',
                alignItems: 'center',
              }}
            >
              {credential.totp.length > 0 && (
                <Button size="small" onClick={onCopyTotp}>
                  <Typography
                    sx={{
                      pb: 0,
                      mb: 0,
                      textAlign: 'left',
                    }}
                    variant="caption"
                  >
                    {getCurrentTotpCode(credential)}
                  </Typography>
                </Button>
              )}
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{ zIndex: '2147483642', height: '200px' }}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                  sx: { padding: 0 },
                }}
                onClick={e => e.stopPropagation()}
              >
                <MenuItem onClick={onCopyUsername}>{t('inline-menu-credential-item.copy-username')}</MenuItem>
                <MenuItem onClick={onCopyPassword}>{t('inline-menu-credential-item.copy-password')}</MenuItem>
              </Menu>
              {settings.hideCredentialDetailsOnInlineMenu && (
                <IconButton size="small" onClick={handleMoreButtonClick}>
                  <MoreHoriz fontSize="small" />
                </IconButton>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '1px',
                  justifyItems: 'center',
                  alignItems: 'center',
                }}
              >
                <Menu
                  id="basic-menu-details"
                  open={openDetailsMenu}
                  anchorEl={anchorElDetails}
                  onClose={handleCloseDetails}
                  sx={{ ml: 0.1 }}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button-details',
                    sx: { padding: 0 },
                  }}
                  anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                  }}
                  onClick={e => e.stopPropagation()}
                  PaperProps={{
                    sx: {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      borderRadius: '15px',
                    },
                  }}
                >
                  <Box sx={{ width: 300, maxHeight: '300px' }}>
                    <CredentialDetails
                      credential={credential}
                      getStatus={async () => {
                        return status;
                      }}
                      onCopyUsername={() => {
                        handleCopyUsername(credential, false);
                        handleCloseDetails();
                      }}
                      onCopyPassword={() => {
                        handleCopyPassword(credential, false);
                        handleCloseDetails();
                      }}
                      onCopyTotp={() => {
                        handleCopyTotp(credential, false);
                        handleCloseDetails();
                      }}
                      onCopy={async (text: string) => {
                        await onCopy(text);
                        handleCloseDetails();
                        return true;
                      }}
                      onFillSingleField={onFillSingleField}
                      onRedirectUrl={(url: string) => {
                        onRedirectUrl(url);
                        setOpenDetailsMenu(false);
                        handleCloseDetails();
                        return true;
                      }}
                      notifyAction={props.notifyAction}
                      showTitle={false}
                      showModified={false}
                      allowAutofillField={true}
                    />
                  </Box>
                </Menu>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '5px', alignItems: 'center' }}>
            <Typography
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              variant="body2"
            >
              {credential.username}
            </Typography>
            {credentialsAreFromMultipleDatabases() && (
              <Typography
                sx={{
                  color: 'text.disabled',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  pr: '5px',
                }}
                variant="body2"
              >
                {credential.databaseName}
              </Typography>
            )}
          </Box>
        </Box>

        {!settings.hideCredentialDetailsOnInlineMenu && (
          <Box sx={{ height: '100%', position: 'absolute', right: 0 }}>
            <IconButton sx={{ borderRadius: 0, p: 0, m: 0, height: '100%' }} onClick={handleDetailsButtonClick}>
              <ChevronRightIcon fontSize="medium" style={{ color: 'gray' }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </MenuItem>
  );
}
