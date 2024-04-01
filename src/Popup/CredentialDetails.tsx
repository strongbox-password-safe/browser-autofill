import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import * as OTPAuth from 'otpauth';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { Badge, Box, Chip, CircularProgress, Button, TextField, IconButton, Tooltip } from '@mui/material';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { BackgroundManager } from '../Background/BackgroundManager';
import StarIcon from '@mui/icons-material/Star';
import Countdown from './Countdown';
import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import CustomMarkDown from './CustomMarkDown';
import CustomTextBox from './CustomTextBox';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';

interface Props {
  credential: AutoFillCredential;
  getStatus: () => Promise<GetStatusResponse | null>;
  onCopyUsername: (credential: AutoFillCredential, notifyAction?: boolean) => void;
  onCopyPassword: (credential: AutoFillCredential, notifyAction?: boolean) => void;
  onCopyTotp: (credential: AutoFillCredential, notifyAction?: boolean) => void;
  onFillSingleField: (text: string) => void;
  onCopy: (text: string) => Promise<boolean>;
  onRedirectUrl: (url: string) => void;
  notifyAction: (message: string) => void;
  showTitle: boolean;
  showModified: boolean;
  allowAutofillField: boolean;
}

function CredentialDetails(props: Props) {
  const { credential, notifyAction } = props;
  const [icon, setIcon] = React.useState(credential.icon);
  const [loadingIcon, setLoadingIcon] = React.useState(true);
  const [t] = useTranslation('global');
  const [totp, setTotp] = React.useState(credential.totp);
  const [markdownNotes, setMarkdownNotes] = React.useState(false);

  React.useEffect(() => {
    const asyncFunc = async () => {
      getIcon();
      setTotp(getCurrentTotpCode());

      const status = await props.getStatus();

      if (status) {
        setMarkdownNotes(status.serverSettings.markdownNotes);
      }
    };

    asyncFunc();
  }, [credential]);

  const getIcon = async () => {
    if (!props.credential.icon) {
      const iconResponse = await NativeAppApi.getInstance().getIcon(credential.databaseId, credential.uuid);

      if (iconResponse) {
        setIcon(iconResponse.icon);
      }
    } else {
      setIcon(props.credential.icon);
    }

    setLoadingIcon(false);
  };

  const onCopyUsername = () => {
    props.onCopyUsername(credential, false);
    notifyAction(t('notification-toast.username-copied'));
  };

  const onCopyPassword = () => {
    props.onCopyPassword(credential, false);
    notifyAction(t('notification-toast.password-copied'));
  };

  const onCopyTotp = (value: string) => {
    credential.totp = value.replace('-', String());
    props.onCopyTotp(credential, false);
    notifyAction(t('notification-toast.totp-copied'));
  };

  const onCopyUrl = async () => {
    const textCopied = await props.onCopy(credential.url);

    if (textCopied) {
      notifyAction(t('notification-toast.url-copied'));
    } else {
    }
  };

  const onCopyCustomField = async (text: string) => {
    const textCopied = await props.onCopy(text);

    if (textCopied) {
      notifyAction(t('notification-toast.custom-field-copied'));
    } else {
    }
  };

  const onRedirectUrl = (url: string | null = null) => {
    if (!url) {
      url = credential.url;
    }

    props.onRedirectUrl(url);
  };

  const getCurrentTotpCode = (): string => {
    if (credential.totp.length > 0) {
      try {
        const parsedTotp = OTPAuth.URI.parse(credential.totp);
        let currentTotpCode = parsedTotp.generate();

        if (currentTotpCode.length > 0) {
          const middle = Math.floor(currentTotpCode.length / 2);
          if (middle > 0) {
            currentTotpCode = currentTotpCode.substring(0, middle) + '-' + currentTotpCode.substring(middle);
          }
        }

        return currentTotpCode;
      } catch (error) {
      }
    }

    return '';
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

  return (
    <Card style={{ boxShadow: 'none', padding: '15px' }}>
      {props.showTitle && (
        <CardHeader
          sx={{ p: 2, pb: 4 }}
          title={
            <Box
              display="flex"
              sx={{
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
                  cursor: 'pointer',
                }}
                onClick={() => onRedirectUrl()}
              >
                {loadingIcon ? (
                  <Box display="block" sx={{ height: 32, mr: '8px' }}>
                    <CircularProgress style={{ color: 'gray' }} size={20} />
                  </Box>
                ) : icon ? (
                  <Box component="img" display="block" sx={{ height: 32, marginRight: '8px' }} alt="Icon" src={icon} />
                ) : (
                  <Box display="block" sx={{ height: 32, mr: '8px' }}>
                    <Badge />
                  </Box>
                )}
              </Box>
              <Box sx={{ width: '100%', pr: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => onRedirectUrl()}>
                <Typography variant="h6" sx={{ textAlign: 'left' }}>
                  {credential.title}
                </Typography>
                {credential.favourite && <StarIcon sx={{ color: 'yellow', ml: '5px' }} />}
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Tooltip title={t('current-tab-credentials.autofill')} placement="bottom" arrow>
                  <Button variant="outlined" color="primary" onClick={autofill} sx={{ maxWidth: '100px', overflow: 'hidden', paddingLeft: '14px' }}>
                    <ContentPasteGoIcon />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          }
        />
      )}

      <CardContent sx={{ p: 0 }}>
        {credential.username && (
          <Box sx={{ alignItems: 'center', pt: 1 }}>
            <CustomTextBox
              title={t('create-new-entry-dialog.username')}
              value={credential.username}
              allowCopy={true}
              allowAutofill={props.allowAutofillField}
              onCopy={onCopyUsername}
              onAutofill={props.onFillSingleField}
            ></CustomTextBox>
          </Box>
        )}

        {credential.password && (
          <Box sx={{ alignItems: 'center', pt: 3 }}>
            <CustomTextBox
              title={t('create-new-entry-dialog.password')}
              value={credential.password}
              allowConceal={true}
              allowCopy={true}
              allowAutofill={props.allowAutofillField}
              onCopy={onCopyPassword}
              onAutofill={props.onFillSingleField}
            ></CustomTextBox>
          </Box>
        )}

        {totp && (
          <>
            <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', pt: 3 }}>
              <Box sx={{ p: 1 }}>
                <Countdown
                  seconds={30}
                  onLoop={() => {
                    setTotp(getCurrentTotpCode());
                  }}
                ></Countdown>
              </Box>
              <CustomTextBox
                title={t('create-new-entry-dialog.totp')}
                value={totp}
                allowCopy={true}
                allowAutofill={props.allowAutofillField}
                onCopy={onCopyTotp}
                onAutofill={value => props.onFillSingleField?.(value.replace('-', String()))}
              ></CustomTextBox>
            </Box>
          </>
        )}

        {credential.url && (
          <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', pt: 3 }}>
            <CustomTextBox
              title={t('create-new-entry-dialog.url')}
              value={credential.url}
              allowCopy={true}
              allowAutofill={props.allowAutofillField}
              allowRedirect={true}
              onCopy={onCopyUrl}
              onAutofill={props.onFillSingleField}
              onRedirect={onRedirectUrl}
            ></CustomTextBox>
          </Box>
        )}

        {Object.keys(credential.customFields).length > 0 && (
          <Box>
            {Object.keys(credential.customFields).map(key => {
              const value: any = credential.customFields[key];
              return (
                <Box key={value.key} sx={{ alignItems: 'center', pt: 3 }}>
                  <CustomTextBox
                    key={value.key}
                    title={value.key}
                    value={value.value}
                    allowConceal={value.concealable}
                    allowCopy={true}
                    allowAutofill={props.allowAutofillField}
                    onCopy={onCopyCustomField}
                    onAutofill={props.onFillSingleField}
                  ></CustomTextBox>
                </Box>
              );
            })}
          </Box>
        )}

        {credential.modified && props.showModified && (
          <Box sx={{ pt: 3, display: 'flex', alignItems: 'row' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ pt: 0, pl: 0.5, textAlign: 'left', fontFamily: '"Roboto","Helvetica","Arial",sans-serif' }}>
              {t('create-new-entry-dialog.modified-date')}:
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ m: 0, pl: 0.5, textAlign: 'left', fontFamily: '"Roboto","Helvetica","Arial",sans-serif' }}>
              {credential.modified}
            </Typography>
          </Box>
        )}

        {credential.tags.length > 0 && (
          <Box sx={{ pt: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                pl: 0,
                textAlign: 'left',
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
              }}
            >
              {t('current-tab-credentials.tags')}
            </Typography>
            <Box sx={{ textAlign: 'left', p: 2 }}>
              {credential.tags.map(tag => (
                <Chip key={tag} sx={{ m: 1, borderRadius: '5px  ' }} label={tag} color="primary" />
              ))}
            </Box>
          </Box>
        )}

        {credential.notes && !markdownNotes && (
          <Box sx={{ pt: 3 }}>
            <TextField sx={{ width: '100%' }} id="outlined-multiline-static" label={t('current-tab-credentials.notes')} multiline rows={4} defaultValue={credential.notes} />
          </Box>
        )}

        {credential.notes && markdownNotes && (
          <Box sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'row', justifyContent: 'space-between' }}>
              <Typography
                variant="subtitle2"
                sx={{
                  pt: 0,
                  pl: 0,
                  textAlign: 'left',
                  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t('current-tab-credentials.notes')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'left', p: 0, pt: 1 }}>
              <CustomMarkDown onRedirectUrl={onRedirectUrl} text={credential.notes} />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
    
  );
}

export default CredentialDetails;
