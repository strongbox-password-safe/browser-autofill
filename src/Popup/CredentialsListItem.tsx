import * as React from 'react';
import Typography from '@mui/material/Typography';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import Box from '@mui/system/Box';
import { Badge } from '@mui/icons-material';
import { CircularProgress, IconButton, InputAdornment, ListItem, Tooltip } from '@mui/material';
import * as OTPAuth from 'otpauth';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { useTranslation } from 'react-i18next';
import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { FontSize, Settings } from '../Settings/Settings';
import { BackgroundManager } from '../Background/BackgroundManager';
import { SettingsStore } from '../Settings/SettingsStore';
import StarIcon from '@mui/icons-material/Star';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface CredentialListItemProps {
  credential: AutoFillCredential;
  showToast: (message: string) => void;
  onClick: (credential: AutoFillCredential) => void;
  selected: boolean;
}

export default function CredentialsListItem({ credential, selected, onClick }: CredentialListItemProps) {
  const [settings, setSettings] = React.useState<Settings>(new Settings());
  const [icon, setIcon] = React.useState(credential.icon);
  const [loadingIcon, setLoadingIcon] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [t] = useTranslation('global');
  const { fontSize } = useCustomStyle();

  React.useEffect(() => {
    const getStoredSettings = async () => {
      const stored = await SettingsStore.getSettings();
      setSettings(stored);
    };

    getStoredSettings();

    const getIcon = async () => {
      if (!icon) {
        const iconResponse = await NativeAppApi.getInstance().getIcon(credential.databaseId, credential.uuid);

        if (iconResponse) {
          setIcon(iconResponse.icon);
        }
      }

      setLoadingIcon(false);
    };

    getIcon();
  }, []);

  let currentTotpCode = getCurrentTotpCode();

  if (currentTotpCode.length > 0) {
    const middle = Math.floor(currentTotpCode.length / 2);
    if (middle > 0) {
      currentTotpCode = currentTotpCode.substring(0, middle) + '-' + currentTotpCode.substring(middle);
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

  const getWidth = (isSecondary = false) => {
    const favouriteStartWidth = 20;

    if (settings.hideCredentialDetailsOnPopup) {
      return 250;
    }

    if (isHovered) {
      const width = [FontSize.xl].includes(fontSize)
        ? 95
        : [FontSize.large].includes(fontSize)
        ? 110
        : [FontSize.small].includes(fontSize)
        ? 135
        : 125;

      if (isSecondary) return width;
      return credential.favourite ? width - favouriteStartWidth : width;
    } else {
      const width = 200;

      if (credential.favourite && !isSecondary) {
        return width - favouriteStartWidth;
      }

      return width;
    }
  };

  const autofill = async (): Promise<void> => {
    const tab = await BackgroundManager.getCurrentTab();
    const url = tab ? tab.url : undefined;
    const tabId = tab?.id;

    if (!url || !tabId) {
      return;
    }

    await BackgroundManager.getInstance().fillWithCredential(tabId, credential);

    window.close();
  };

  const onRedirectUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <ListItem
      sx={{ mb: '3px', mt: '3px', cursor: 'pointer' }}
      disableGutters
      disablePadding
      button
      selected={!settings.hideCredentialDetailsOnPopup ? selected : false}
      key={credential.uuid}
      onClick={() => onClick(credential)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        display="flex"
        sx={{
          m: '5px',
          p: '5px',

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
            mt: 'auto',
            mb: 'auto',
          }}
        >
          {loadingIcon ? (
            <Box
              display="block"
              sx={{
                height: 32,
                mr: '5px',
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
                marginRight: '5px',
              }}
              alt="Icon"
              src={icon}
            />
          ) : (
            <Box
              display="block"
              sx={{
                height: 32,
                mr: '5px',
              }}
            >
              <Badge fontSize="large" />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: getWidth(),
              }}
            >
              {credential.title}
            </Typography>

            {credential.favourite && (
              <StarIcon sx={{ fontSize: 16, color: 'yellow', ml: '5px', pl: '0px', pr: '0px' }} />
            )}
          </Box>
          <Box
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '0px',
              padding: 0,
              maxWidth: getWidth(true),
            }}
          >
            <Typography variant="caption" display="inline" color="text.secondary">
              {credential.username}
            </Typography>
          </Box>
        </Box>

        {isHovered && !settings.hideCredentialDetailsOnPopup && (
          <Box sx={{ p: 0, pl: 1, position: 'absolute', right: 0, pr: 1, display: 'flex', alignItems: 'row' }}>
            <Tooltip title={t('general.launch-url')} placement="top" arrow>
              <Box sx={{ pt: 3, pb: 3 }}>
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label={t('general.launch-url')}
                    edge="end"
                    onClick={() => {
                      onRedirectUrl(credential.url);
                    }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </InputAdornment>
              </Box>
            </Tooltip>
            <Tooltip title={t('general.autofill')} placement="top" arrow>
              <Box sx={{ pt: 3, pb: 3 }}>
                <InputAdornment position="end">
                  <IconButton size="small" aria-label={t('general.autofill')} edge="end" onClick={autofill}>
                    <ContentPasteGoIcon />
                  </IconButton>
                </InputAdornment>
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>
    </ListItem>
  );
}
