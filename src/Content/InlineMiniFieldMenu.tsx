import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { Alert, Box, Button, ButtonGroup, CircularProgress, Divider, IconButton, MenuList, Paper, Snackbar, Typography } from '@mui/material';

import { FontSize, LastKnownDatabasesItem } from '../Settings/Settings';
import { AddCircle, ExploreOffOutlined, LockOpenOutlined, SearchOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { InlineMenuCredentialItem } from './InlineMenuCredentialItem';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';
import CloseIcon from '@mui/icons-material/Close';
import HideInlineMenu from './HideInlineMenu';

import { useCustomStyle } from '../Contexts/CustomStyleContext';
import { useTranslation } from 'react-i18next';
import SearchBar, { SearchMode } from '../Popup/SearchBar';
import { SearchResponse } from '../Messaging/Protocol/SearchResponse';
import { Virtuoso } from 'react-virtuoso';
import { GetIconResponse } from '../Messaging/Protocol/GetIconResponse';
import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import { NativeAppApi } from '../Messaging/NativeAppApi';

export interface InlineMiniFieldMenuProps {
  status: GetStatusResponse | null;
  url: string;
  unlockedDatabaseAvailable: boolean;
  showCreateNew: boolean;
  credentials: AutoFillCredential[];
  getCredentials: (skip: number, take: number) => Promise<AutoFillCredential[]>;
  onCreateNewEntry: () => void;
  onUnlockDatabase: (databaseUuid: string) => Promise<UnlockResponse | null>;
  onFillWithCredential: (credential: AutoFillCredential) => Promise<void>;
  onFillSingleField: (text: string) => Promise<void>;
  unlockableDatabases: LastKnownDatabasesItem[];
  onCopyUsername: (credential: AutoFillCredential) => void;
  onCopyPassword: (credential: AutoFillCredential) => void;
  onCopyTotp: (credential: AutoFillCredential) => void;
  onCopy: (text: string) => Promise<boolean>;
  onRedirectUrl: (url: string) => void;
  refreshInlineMenu: () => void;
  hideInlineMenusForAWhile: () => void;
  beforeOpenSubMenu: (showDetails: boolean, restoreIframeSize?: boolean) => void;
  notifyAction: (message: string) => void;
  searchCredentials: (query: string, skip: number, take: number) => Promise<SearchResponse | null>;
  getIcon: (databaseId: string, nodeId: string) => Promise<GetIconResponse | null>;
  resize: () => void;
}

export default function InlineMiniFieldMenu(props: InlineMiniFieldMenuProps) {
  
  
  const nativeAppApi = NativeAppApi.getInstance();
  const [searchPageSize, setSearchPageSize] = React.useState(nativeAppApi.credentialResultsPageSize);
  const [pendingUnlockDatabases, setPendingUnlockDatabases] = React.useState<Set<string>>(new Set());
  const [closeButton, setCloseButton] = React.useState(null);
  const [openHideMenu, setOpenHideMenu] = React.useState(false);
  const { darkMode, fontSize } = useCustomStyle();
  const [t] = useTranslation('global');
  const [loading, setLoading] = React.useState(true);
  const [searching, setSearching] = React.useState(false);
  const [credentials, setCredentials] = React.useState<AutoFillCredential[]>(() => []);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [credentialResultsCompleted, setCredentialResultsCompleted] = React.useState(true);
  const [showSearchBar, setShowSearchBar] = React.useState(false);

  const [popupVisible, setPopupVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  React.useEffect(() => {
    bindSearchOrUrlResults();
  }, []);

  React.useEffect(() => {
    setPendingUnlockDatabases(new Set());
  }, [props]);

  React.useEffect(() => {
    props.resize();
  }, [credentials, loading, searching, showSearchBar]);

  const handleOpenHideMenu = (event: any) => {
    props.beforeOpenSubMenu(false);
    setCloseButton(event.currentTarget);

    setTimeout(() => {
      setOpenHideMenu(true);
    }, 50);
  };

  const handleCredentialClick = (credential: AutoFillCredential) => {
    props.onFillWithCredential(credential);
  };

  const handleCopyUsername = (credential: AutoFillCredential, notifyAction = true) => {
    props.onCopyUsername(credential);

    if (notifyAction) {
      props.notifyAction(t('notification-toast.username-copied'));
    }
  };
  const handleCopyPassword = (credential: AutoFillCredential, notifyAction = true) => {
    props.onCopyPassword(credential);

    if (notifyAction) {
      props.notifyAction(t('notification-toast.password-copied'));
    }
  };
  const handleCopyTotp = (credential: AutoFillCredential, notifyAction = true) => {
    props.onCopyTotp(credential);

    if (notifyAction) {
      props.notifyAction(t('notification-toast.totp-copied'));
    }
  };

  const handleCreateNewEntry = () => {
    props.onCreateNewEntry();
  };

  const handleUnlockDatabase = async (databaseUuid: string) => {
    pendingUnlockDatabases.add(databaseUuid);
    setPendingUnlockDatabases(new Set(pendingUnlockDatabases));

    const unlockResponse = await props.onUnlockDatabase(databaseUuid);

    if (unlockResponse?.success) {
      props.refreshInlineMenu();
    } else {
      setPendingUnlockDatabases(new Set());
    }
  };

  const credentialsAreFromMultipleDatabases = () => {
    const dbs = credentials.map(credential => credential.databaseId);
    const uniqueDbs = new Set(dbs);
    return uniqueDbs.size > 1;
  };

  const handleSearchChange = async (searchText: string) => {
    bindSearchOrUrlResults(searchText);
  };

  const bindSearchOrUrlResults = async (searchText = '') => {
    const trimmed = searchText.trim();

    setLoading(true);
    setCredentials([]);
    setSearchQuery(trimmed);

    if (trimmed != String()) {
      const results = await search(trimmed, 0, nativeAppApi.credentialResultsPageSize);

      setSearchPageSize(nativeAppApi.credentialResultsPageSize);
      setSearching(true);
      setCredentialResultsCompleted(false);
      setLoading(false);
      if (results) {
        
        
        
        
        
        
        

        setCredentials(results);
      } else {
        
      }
    } else {
      const results = props.credentials;
      setSearchPageSize(results.length);
      setCredentialResultsCompleted(false);
      setSearching(false);
      setLoading(false);
      if (results) {
        setCredentials(results);
      } else {
        
      }
    }
  };

  async function search(query: string, skip = 0, take: number = searchPageSize): Promise<AutoFillCredential[] | undefined> {
    const response = await props.searchCredentials(query, skip, take);

    return response ? response.results : undefined;
  }

  const getNext = async () => {
    const updated = searchQuery ? await search(searchQuery, credentials.length) : await props.getCredentials(credentials.length, nativeAppApi.credentialResultsPageSize);

    if (updated) {
      
      
      
      
      
      
      

      if (updated.length > 0) {
        setCredentials([...credentials, ...updated]);
      } else {
        setCredentialResultsCompleted(true);
      }
    } else {
      
    }
  };

  const Footer = () => {
    return credentialResultsCompleted || credentials.length === 0 ? null : (
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

  const getWidth = () => {
    return `${fontSize == FontSize.small ? '250px' : fontSize == FontSize.medium ? '300px' : '380px'}`;
  };

  const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setPopupVisible(false);
  };

  const showToast = (value: string) => {
    setToastMessage(value);
    setPopupVisible(true);
  };

  const getHeight = () => {
    return `${fontSize == FontSize.small ? '184px' : fontSize == FontSize.medium ? '210px' : fontSize == FontSize.large ? '255px' : '291px'}`;
  };

  return (
    <Paper sx={{ display: 'inline-block', zIndex: '2147483640', borderRadius: '15px' }}>
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            zIndex: 1,
            top: 0,
            right: 0,
            backgroundColor: `${darkMode ? '#1e1e1e' : 'gray'}`,
            borderRadius: '50%',
            cursor: 'pointer',
            border: `1px solid ${!darkMode ? 'gray' : '#1e1e1e'}`,
            boxSizing: 'border-box',
          }}
        >
          <HideInlineMenu
            url={props.url}
            anchorEl={closeButton}
            open={openHideMenu}
            setOpenHideMenu={setOpenHideMenu}
            hideInlineMenusForAWhile={props.hideInlineMenusForAWhile}
            notifyAction={props.notifyAction}
          />
          <IconButton sx={{ width: '20px', height: '20px', color: `${darkMode ? 'gray' : '#1e1e1e'}` }} onClick={handleOpenHideMenu}>
            <CloseIcon sx={{ fontSize: '15px', fontWeight: 'bold' }} />
          </IconButton>
        </Box>
      </Box>
      <MenuList autoFocusItem={false} disabledItemsFocusable={true} sx={{ pb: 0, pt: 0, mt: 2, mb: 2 }}>
        {!loading ? (
          <div>
            {credentials.length === 0 && props.unlockedDatabaseAvailable && (
              <div style={{ width: getWidth() }}>
                <MenuItem disabled dense>
                  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '2px' }}>
                    <SearchOff />
                    {t('inline-mini-field-menu.no-matching-entries-found')}
                  </Box>
                </MenuItem>
              </div>
            )}

            {(credentials.length <= 3 && !searching) || (credentials.length <= 2 && searching) ? (
              credentials.map(credential => (
                <div key={credential.uuid} style={{ maxHeight: getHeight(), width: getWidth() }}>
                  <InlineMenuCredentialItem
                    status={props.status}
                    credential={credential}
                    onFillSingleField={props.onFillSingleField}
                    handleCredentialClick={handleCredentialClick}
                    handleCopyUsername={handleCopyUsername}
                    handleCopyPassword={handleCopyPassword}
                    handleCopyTotp={handleCopyTotp}
                    onCopy={props.onCopy}
                    onRedirectUrl={props.onRedirectUrl}
                    notifyAction={showToast}
                    credentialsAreFromMultipleDatabases={credentialsAreFromMultipleDatabases}
                    getIcon={props.getIcon}
                    beforeOpenSubMenu={props.beforeOpenSubMenu}
                  />
                </div>
              ))
            ) : (
              <div style={{ maxHeight: getHeight(), width: getWidth() }}>
                <Virtuoso
                  style={{
                    minHeight: `${credentials.length === 0 ? '0px' : getHeight()}`,
                    cursor: 'pointer',
                  }}
                  data={credentials}
                  overscan={48}
                  endReached={() => {
                    if (!credentialResultsCompleted) {
                      getNext();
                    }
                  }}
                  itemContent={(index, credential: AutoFillCredential) => {
                    return (
                      <InlineMenuCredentialItem
                        status={props.status}
                        key={credential.uuid}
                        credential={credential}
                        onFillSingleField={props.onFillSingleField}
                        handleCredentialClick={handleCredentialClick}
                        handleCopyUsername={handleCopyUsername}
                        handleCopyPassword={handleCopyPassword}
                        handleCopyTotp={handleCopyTotp}
                        onCopy={props.onCopy}
                        onRedirectUrl={props.onRedirectUrl}
                        credentialsAreFromMultipleDatabases={credentialsAreFromMultipleDatabases}
                        getIcon={props.getIcon}
                        beforeOpenSubMenu={props.beforeOpenSubMenu}
                        notifyAction={showToast}
                      />
                    );
                  }}
                  components={{ Footer }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', width: getWidth(), paddingTop: '10px', paddingBottom: '10px' }}>
            <CircularProgress size="1rem" />
            <Box>
              <Typography color="text.secondary" variant="body1" sx={{ textAlign: 'center' }}>
                {searching ? t('general.searching') : t('general.loading')}
              </Typography>
            </Box>
          </div>
        )}

        {props.unlockableDatabases.length !== 0 && props.unlockedDatabaseAvailable ? <Divider /> : ''}
        {props.unlockableDatabases.map(database => (
          <MenuItem dense onClick={() => handleUnlockDatabase(database.uuid)} key={database.uuid}>
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '5px' }}>
              {!pendingUnlockDatabases.has(database.uuid) ? <LockOpenOutlined htmlColor="orange" /> : <CircularProgress style={{ color: 'gray' }} size={20} />}

              <>
                {t('inline-mini-field-menu.unlock', { database: database.nickName })}
                {/* </Typography> */}{' '}
              </>
            </Box>
          </MenuItem>
        ))}

        {!props.showCreateNew && props.unlockableDatabases.length == 0 && credentials.length === 0 ? (
          <MenuItem disabled dense>
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '5px' }}>
              <ExploreOffOutlined />
              {t('inline-mini-field-menu.no-autofill-enabled-databases')}
            </Box>
          </MenuItem>
        ) : (
          ''
        )}
      </MenuList>

      {showSearchBar && (
        <Box sx={{ width: getWidth() }}>
          <SearchBar
            searchMode={SearchMode.InlineMenu}
            autofocus={true}
            setSearching={setSearching}
            setLoading={setLoading}
            handleSearchChange={handleSearchChange}
            onDismissButon={() => {
              setShowSearchBar(false);
            }}
          />
        </Box>
      )}

      {props.unlockedDatabaseAvailable && !showSearchBar && (
        <Box>
          <Divider />
          <ButtonGroup variant="outlined" aria-label="outlined button group" sx={{ width: '100%' }}>
            {props.showCreateNew && (
              <Button
                sx={{
                  overflow: 'hidden',
                  width: '50%',
                  borderBottomLeftRadius: 15,
                  borderBottom: 'none',
                  borderLeft: 'none',
                  borderTop: 'none',
                  '&:hover': {
                    borderLeft: 'none',
                    borderBottom: 'none',
                    borderTop: 'none',
                  },
                }}
                onClick={handleCreateNewEntry}
                variant="outlined"
                startIcon={<AddCircle />}
              >
                {t('general.create')}
              </Button>
            )}
            <Button
              sx={{
                overflow: 'hidden',
                width: '50%',
                borderBottomRightRadius: 15,
                borderBottom: 'none',
                borderRight: 'none',
                borderTop: 'none',
                '&:hover': {
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderTop: 'none',
                },
              }}
              onClick={() => setShowSearchBar(true)}
              variant="outlined"
              startIcon={<SearchIcon />}
            >
              {t('general.search')}
            </Button>
          </ButtonGroup>
        </Box>
      )}
      <Snackbar open={popupVisible} autoHideDuration={1000} onClose={handleToastClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleToastClose} severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
