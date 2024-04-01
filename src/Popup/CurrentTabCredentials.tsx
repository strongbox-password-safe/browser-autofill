import * as React from 'react';
import List from '@mui/material/List';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { useEffect, useState } from 'react';
import CredentialsListItem from './CredentialsListItem';
import NoResultsFoundPopupComponent from './NoResultsFoundPopupComponent';
import { BackgroundManager } from '../Background/BackgroundManager';
import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import SearchBar, { SearchMode } from './SearchBar';
import { GroupedVirtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import CredentialDetails from './CredentialDetails';
import { AddCircle } from '@mui/icons-material';
import { WellKnownField } from '../Messaging/Protocol/WellKnownField';
import { SettingsStore } from '../Settings/SettingsStore';
import { Settings } from '../Settings/Settings';

interface CurrentTabCredentialsComponentProps {
  showToast: (message: string) => void;
  initScrollbars: () => void;
}

function CurrentTabCredentialsComponent({ showToast, initScrollbars }: CurrentTabCredentialsComponentProps) {
  const nativeAppApi = NativeAppApi.getInstance();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<AutoFillCredential[]>(() => []);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [credentialResultsCompleted, setCredentialResultsCompleted] = React.useState(true);
  const [selectedCredential, setSelectedCredential] = useState<AutoFillCredential | null>(null);
  const [settings, setSettings] = React.useState<Settings>(new Settings());
  const [groupCounts, setGroupCounts] = React.useState<number[]>([]);
  const [groups, setGroups] = React.useState<string[]>([]);

  const [t] = useTranslation('global');

  useEffect(() => {
    const getStoredSettings = async () => {
      const stored = await SettingsStore.getSettings();
      setSettings(stored);
    };

    getStoredSettings();
    bindSearchOrUrlResults();
    initScrollbars();
  }, []);

  const handleSearchChange = async (searchText: string) => {
    bindSearchOrUrlResults(searchText);
  };

  const getNext = async () => {
    const updated = searchQuery ? await search(searchQuery, credentials.length) : await getCredentialsForCurrentUrl(credentials.length);

    if (updated) {
      
      
      
      
      
      
      

      if (updated.length > 0) {
        setCredentials([...credentials, ...updated]);

        calculateGroupsSoFar([...credentials, ...updated]);
      } else {
        setCredentialResultsCompleted(true);
      }
    } else {
      
    }
  };

  const bindSearchOrUrlResults = async (searchText = '') => {
    const trimmed = searchText.trim();

    setLoading(true);
    setCredentials([]);
    setGroups([]);
    setSearchQuery(trimmed);

    if (trimmed != String()) {
      const results = await search(trimmed);

      setSearching(true);
      setCredentialResultsCompleted(false);
      setLoading(false);
      if (results) {
        
        
        
        
        
        
        

        setCredentials(results);

        calculateGroupsSoFar(results);

        if (results && results[0]) {
          setSelectedCredential(results[0]);
        }
      } else {
        
      }
    } else {
      const results = await getCredentialsForCurrentUrl();

      setSearching(false);
      setLoading(false);
      if (results) {
        setCredentials(results);

        calculateGroupsSoFar(results);
      } else {
        
      }

      if (results && results[0]) {
        setSelectedCredential(results[0]);
      }
    }
  };

  const search = async (query: string, skip = 0, take: number = nativeAppApi.credentialResultsPageSize): Promise<AutoFillCredential[] | undefined> => {
    const response = await NativeAppApi.getInstance().search(query, skip, take);

    return response ? response.results : undefined;
  };

  const getCredentialsForCurrentUrl = async (skip = 0, take = nativeAppApi.credentialResultsPageSize): Promise<AutoFillCredential[] | undefined> => {
    const tab = await BackgroundManager.getCurrentTab();
    const url = tab ? tab.url : undefined;
    const tabId = tab?.id;

    if (!url || !tabId) {
      return;
    }

    const response = await NativeAppApi.getInstance().credentialsForUrl(url, skip, take);

    return response ? response.results : undefined;
  };

  const Footer = () => {
    return credentialResultsCompleted ? null : (
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size="1rem" />
      </div>
    );
  };

  const handleCreateNewEntry = async (): Promise<void> => {
    const tab = await BackgroundManager.getCurrentTab();
    const url = tab ? tab.url : undefined;
    const tabId = tab?.id;

    if (!url || !tabId) {
      return;
    }

    await BackgroundManager.getInstance().openCreateNewDialog(tabId);

    window.close();
  };

  const onItemClicked = async (credential: AutoFillCredential): Promise<void> => {
    const tab = await BackgroundManager.getCurrentTab();
    const url = tab ? tab.url : undefined;
    const tabId = tab?.id;

    if (!url || !tabId) {
      return;
    }

    await BackgroundManager.getInstance().fillWithCredential(tabId, credential);

    window.close();
  };

  const onItemClickedAlternative = (credential: AutoFillCredential) => {
    setSelectedCredential(credential);
  };

  const onCopyUsername = (credential: AutoFillCredential, notifyAction = true) => {
    NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.username);

    if (notifyAction) {
      showToast(t('notification-toast.username-copied'));
    }
  };

  const onCopyPassword = (credential: AutoFillCredential, notifyAction = true) => {
    NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.password);

    if (notifyAction) {
      showToast(t('notification-toast.password-copied'));
    }
  };

  const onCopyTotp = (credential: AutoFillCredential, notifyAction = true) => {
    NativeAppApi.getInstance().copyField(credential.databaseId, credential.uuid, WellKnownField.totp, true);

    if (notifyAction) {
      showToast(t('notification-toast.totp-copied'));
    }
  };

  const onCopy = async (value: string) => {
    const resp = await NativeAppApi.getInstance().copyString(value);

    return resp?.success ?? false;
  };

  const onRedirectUrl = async (newUrl: string): Promise<void> => {
    await BackgroundManager.getInstance().redirectUrl(newUrl);
    window.close();
  };

  const getStatus = async () => {
    return await NativeAppApi.getInstance().getStatus();
  };

  const calculateGroupsSoFar = React.useCallback((creds: AutoFillCredential[]) => {
    const groups = creds.reduce((collectedGroups: string[], current) => {
      if (!collectedGroups.includes(current.databaseName)) {
        collectedGroups.push(current.databaseName);
      }

      return collectedGroups;
    }, []);

    const groupCounts: number[] = [];

    groups.forEach(group => {
      const groupCount = creds.filter(cred => cred.databaseName === group).length;
      groupCounts.push(groupCount);
    });

    setGroupCounts(groupCounts);
    setGroups(groups);
  }, []);

  return (
    <Box sx={{ flexGrow: 1, width: settings.hideCredentialDetailsOnPopup || credentials.length === 0 ? 500 : 700 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', p: 2, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <SearchBar searchMode={SearchMode.Popup} autofocus={true} setSearching={setSearching} setLoading={setLoading} handleSearchChange={handleSearchChange} />
            {!settings.hideCredentialDetailsOnPopup && (
              <Button onClick={handleCreateNewEntry} variant="outlined" startIcon={<AddCircle />}>
                {t('general.create')}
              </Button>
            )}
          </Box>
        </Grid>
        <Grid item xs={settings.hideCredentialDetailsOnPopup || credentials.length === 0 ? 12 : 4.5}>
          <Box>
            <List
              sx={{
                minwidth: '200px',
                overflow: 'hidden',
                scrollbarWidth: 'none',
                mt: 0,
                pt: 0,
                pb: 0,
              }}
            >
              {!loading ? (
                credentials.length === 0 ? (
                  <NoResultsFoundPopupComponent />
                ) : (
                  <Box key="parent-div" sx={{ maxHeight: '400px', overflowY: 'auto', pl: 1 }}>
                    <GroupedVirtuoso
                      style={{ height: 400 }}
                      groupCounts={groupCounts}
                      groupContent={index => {
                        return (
                          <Paper elevation={18} style={{ padding: '0.3rem 1rem', boxShadow: 'none' }}>
                            {groups[index]}
                          </Paper>
                        );
                      }}
                      endReached={() => {
                        getNext();
                      }}
                      itemContent={index => {
                        const credential = credentials[index];
                        return (
                          <CredentialsListItem
                            key={credential.uuid}
                            credential={credential}
                            showToast={showToast}
                            onClick={credential => (settings.hideCredentialDetailsOnPopup ? onItemClicked(credential) : onItemClickedAlternative(credential))}
                            selected={credential.uuid == selectedCredential?.uuid}
                          />
                        );
                      }}
                      components={{ Footer }}
                    />
                  </Box>
                )
              ) : (
                <Box sx={{ height: 400, textAlign: 'center', pt: 5 }}>
                  <CircularProgress size="1rem" />
                  <Box>
                    <Typography color="text.secondary" variant="body1" sx={{ textAlign: 'center' }}>
                      {searching ? t('general.searching') : t('general.loading')}
                    </Typography>
                  </Box>
                </Box>
              )}
            </List>
          </Box>
        </Grid>
        {!settings.hideCredentialDetailsOnPopup && credentials.length != 0 && (
          <Grid item xs={7.5} sx={{ pr: 1 }}>
            <Paper sx={{ textAlign: 'center', height: '100%', pb: 0, boxShadow: 'none' }}>
              {credentials.length > 0 && selectedCredential && (
                <Box sx={{ maxHeight: 400, overflowY: 'scroll', boxShadow: 'none' }}>
                  <CredentialDetails
                    getStatus={getStatus}
                    onCopyUsername={onCopyUsername}
                    onCopyPassword={onCopyPassword}
                    onCopyTotp={onCopyTotp}
                    onCopy={onCopy}
                    onRedirectUrl={onRedirectUrl}
                    notifyAction={showToast}
                    credential={selectedCredential}
                    showTitle={true}
                    showModified={true}
                    allowAutofillField={false}
                    onFillSingleField={() => {
                    }}
                  ></CredentialDetails>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default CurrentTabCredentialsComponent;
