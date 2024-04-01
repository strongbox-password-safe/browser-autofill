import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { Alert, Box, Button, ButtonGroup, CircularProgress, Divider, MenuList, Paper, Snackbar, Typography } from '@mui/material';

import { LastKnownDatabasesItem } from '../Settings/Settings';
import { ExploreOffOutlined, SearchOff } from '@mui/icons-material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { InlineMenuCredentialItem } from './InlineMenuCredentialItem';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HideInlineMenu from './HideInlineMenu';
import UnlockDatabasesMenu from './UnlockDatabasesMenu';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

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
  inlineMenuTruncatedHeight: string | null;
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
  const [unlockButton, setUnlockButton] = React.useState(null);
  const [openHideMenu, setOpenHideMenu] = React.useState(false);

  const [openUnlockDatabasesMenu, setOpenUnlockDatabasesMenu] = React.useState(false);
  const { sizeHandler } = useCustomStyle();

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
    props.beforeOpenSubMenu(true);
    setCloseButton(event.currentTarget);

    setTimeout(() => {
      setOpenHideMenu(true);
    }, 50);
  };

  const handleDismissButton = () => {
    let message = t('notification-toast.hide-for-a-while');
    props.hideInlineMenusForAWhile();
    props.notifyAction(message);
  };

  const handleOpenUnlockDatabasesMenu = (event: any) => {
    if (props.unlockableDatabases.length == 1) {
      handleUnlockDatabase(props.unlockableDatabases[0].uuid);
    } else {
      props.beforeOpenSubMenu(true);
      setUnlockButton(event.currentTarget);

      setTimeout(() => {
        setOpenUnlockDatabasesMenu(true);
      }, 50);
    }
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

  const handleToastClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setPopupVisible(false);
  };

  const handleHandleCloseHieMenu = () => {
    setOpenHideMenu(false);
    props.beforeOpenSubMenu(true, true);
  };

  const showToast = (value: string) => {
    setToastMessage(value);
    setPopupVisible(true);
  };

  const inlineMenuHasScrollbar = () => {
    const elements = document.querySelectorAll('[data-test-id="virtuoso-scroller"]');

    if (elements.length > 0 && credentials.length > 3) {
      return true;
    }

    return false;
  };

  return (
    <Paper sx={{ display: 'inline-block', zIndex: '2147483640', borderRadius: '15px' }}>
      <MenuList autoFocusItem={false} disabledItemsFocusable={true} sx={{ pb: 0, pt: 0 }}>
        {!loading ? (
          <Box>
            {credentials.length === 0 && props.unlockedDatabaseAvailable && (
              <Box sx={{ width: sizeHandler.getInlineMenuWidth() }}>
                <MenuItem disabled dense>
                  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', pb: 1, pt: 1 }}>
                    <SearchOff />
                    {t('inline-mini-field-menu.no-matching-entries-found')}
                  </Box>
                </MenuItem>
              </Box>
            )}

            {(credentials.length <= 3 && !searching) || (credentials.length <= 2 && searching) ? (
              credentials.map(credential => (
                <Box key={credential.uuid} sx={{ maxHeight: sizeHandler.getInlineMenuHeight(props.inlineMenuTruncatedHeight), width: sizeHandler.getInlineMenuWidth(), pt: 2 }}>
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
                    inlineMenuHasScrollbar={inlineMenuHasScrollbar}
                  />
                </Box>
              ))
            ) : (
              <Box sx={{ maxHeight: sizeHandler.getInlineMenuHeight(props.inlineMenuTruncatedHeight), width: sizeHandler.getInlineMenuWidth(), pt: 2 }}>
                <Virtuoso
                  style={{
                    minHeight: `${credentials.length === 0 ? '0px' : sizeHandler.getInlineMenuHeight(props.inlineMenuTruncatedHeight)}`,
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
                        inlineMenuHasScrollbar={inlineMenuHasScrollbar}
                      />
                    );
                  }}
                  components={{ Footer }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <div style={{ textAlign: 'center', width: sizeHandler.getInlineMenuWidth(), paddingTop: '10px', paddingBottom: '10px' }}>
            <CircularProgress size="1rem" />
            <Box>
              <Typography color="text.secondary" variant="body1" sx={{ textAlign: 'center' }}>
                {searching ? t('general.searching') : t('general.loading')}
              </Typography>
            </Box>
          </div>
        )}

        {!props.showCreateNew && props.unlockableDatabases.length == 0 && credentials.length === 0 ? (
          <MenuItem disabled dense>
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', pt: '5px' }}>
              <ExploreOffOutlined />
              {t('inline-mini-field-menu.no-autofill-enabled-databases')}
            </Box>
          </MenuItem>
        ) : (
          ''
        )}
      </MenuList>

      {showSearchBar && (
        <Box sx={{ width: sizeHandler.getInlineMenuWidth() }}>
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

      {!showSearchBar && (
        <Box>
          <Divider />

          <ButtonGroup
            style={{ alignItems: 'center' }}
            variant="outlined"
            aria-label="outlined button group"
            sx={{
              width: props.unlockedDatabaseAvailable ? sizeHandler.getInlineMenuWidth() : '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {props.unlockedDatabaseAvailable && (
              <Button
                sx={{
                  flexGrow: 1,
                  fontSize: sizeHandler.getInlineMenuFontSize(),
                  overflow: 'hidden',
                  height: '40px',
                  borderBottomLeftRadius: 15,
                  borderBottom: 'none',
                  borderLeft: 'none',
                  borderTop: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    borderLeft: 'none',
                    borderBottom: 'none',
                    borderTop: 'none',
                  },
                }}
                onClick={handleCreateNewEntry}
                variant="outlined"
              >
                <Box
                  sx={{
                    alignContent: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 0.5 }}>
                    <AddCircleOutlineOutlinedIcon sx={{ fontSize: sizeHandler.getBottomToolbarIconSize() }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{t('general.create')}</Box>
                </Box>
              </Button>
            )}

            {props.unlockedDatabaseAvailable && (
              <Button
                onClick={() => setShowSearchBar(true)}
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  fontSize: sizeHandler.getInlineMenuFontSize(),
                  overflow: 'hidden',
                  height: '40px',
                  borderBottomRightRadius: 15,
                  borderBottom: 'none',
                  borderTop: 'none',
                  '&:hover': {
                    borderBottom: 'none',
                    borderTop: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    alignContent: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 0.5 }}>
                    <SearchIcon sx={{ fontSize: sizeHandler.getBottomToolbarIconSize() }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{t('general.search')}</Box>
                </Box>
              </Button>
            )}

            {props.unlockableDatabases.length !== 0 && (
              <Button
                onClick={handleOpenUnlockDatabasesMenu}
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  fontSize: sizeHandler.getInlineMenuFontSize(),
                  overflow: 'hidden',
                  height: '40px',
                  borderBottom: 'none',
                  borderTop: 'none',
                  borderLeft: !props.unlockedDatabaseAvailable ? 'none' : '',
                  '&:hover': {
                    borderLeft: !props.unlockedDatabaseAvailable ? 'none' : '',
                    borderBottom: 'none',
                    borderTop: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    alignContent: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 0.5 }}>
                    {pendingUnlockDatabases.size !== 0 ? (
                      <CircularProgress style={{ color: 'gray' }} size={20} />
                    ) : (
                      <LockOpenIcon sx={{ fontSize: sizeHandler.getBottomToolbarIconSize() }}></LockOpenIcon>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{!props.unlockedDatabaseAvailable && t('database-list-item.unlock')}</Box>
                </Box>
              </Button>
            )}

            <Button
              onClick={handleOpenHideMenu}
              variant="outlined"
              sx={{
                flexGrow: 1,
                fontSize: sizeHandler.getInlineMenuFontSize(),
                overflow: 'hidden',
                height: '40px',
                borderBottom: 'none',
                borderRight: 'none',
                borderTop: 'none',
                borderBottomRightRadius: 15,
                '&:hover': {
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderTop: 'none',
                },
              }}
            >
              <Box
                sx={{
                  alignContent: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 0.5 }}>
                  <CancelOutlinedIcon sx={{ fontSize: sizeHandler.getBottomToolbarIconSize() }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{!props.unlockedDatabaseAvailable && t('general.dismiss')}</Box>
              </Box>
            </Button>
          </ButtonGroup>

          <HideInlineMenu
            url={props.url}
            anchorEl={closeButton}
            open={openHideMenu}
            onCloseMenu={handleHandleCloseHieMenu}
            setOpenHideMenu={setOpenHideMenu}
            hideInlineMenusForAWhile={props.hideInlineMenusForAWhile}
            notifyAction={props.notifyAction}
          />

          <UnlockDatabasesMenu
            unlockableDatabases={props.unlockableDatabases}
            unlockedDatabaseAvailable={props.unlockedDatabaseAvailable}
            pendingUnlockDatabases={pendingUnlockDatabases}
            handleUnlockDatabase={handleUnlockDatabase}
            url={props.url}
            anchorEl={unlockButton}
            setOpenMenu={setOpenUnlockDatabasesMenu}
            open={openUnlockDatabasesMenu}
            notifyAction={props.notifyAction}
          />
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
