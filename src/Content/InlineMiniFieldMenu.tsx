import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { Box, CircularProgress, ClickAwayListener, Divider, MenuList, Paper, Popper } from '@mui/material';
import browser from 'webextension-polyfill';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ContentScriptManager } from './ContentScriptManager';
import { LastKnownDatabasesItem } from '../Settings/Settings';
import { ExploreOffOutlined, LockOpenOutlined, SearchOff } from '@mui/icons-material';
import { InlineMenuCredentialItem } from './InlineMenuCredentialItem';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';

interface InlineMiniFieldMenuProps {
  anchorEl: HTMLElement;
  unlockedDatabaseAvailable: boolean;
  showCreateNew: boolean;
  credentials: AutoFillCredential[];
  onCreateNewEntry: () => void;
  onLaunchStrongbox: () => void;
  onUnlockDatabase: (databaseUuid: string) => Promise<UnlockResponse | null>;
  onFillWithCredential: (credential: AutoFillCredential) => Promise<void>;
  isPasswordField: boolean;
  shadowRootElement: HTMLElement;
  cache: EmotionCache;
  show: boolean;
  unlockableDatabases: LastKnownDatabasesItem[];
  onCopyUsername: (credential: AutoFillCredential) => void;
  onCopyPassword: (credential: AutoFillCredential) => void;
  onCopyTotp: (credential: AutoFillCredential) => void;
  refreshInlineMenu: () => void;
}

export default function InlineMiniFieldMenu(props: InlineMiniFieldMenuProps) {
  const { refreshInlineMenu } = props;
  const [anchorEl] = React.useState<HTMLElement | null>(props.anchorEl);
  const [open, setOpen] = React.useState(Boolean(props.show));
  const [focusFirstItem, setFocusFirstItem] = React.useState(false);
  const [filterCredentials, setFilteredCredentials] = React.useState(props.credentials);
  const [pendingUnlockDatabases, setPendingUnlockDatabases] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (anchorEl) {
      
      const listener = handleKeyDownInAnchorElement;
      anchorEl.addEventListener('keyup', listener);

      const blurListener = handleBlurOnAnchorElement;
      anchorEl.addEventListener('blur', blurListener);

      

      return () => {
        
        anchorEl.removeEventListener('keyup', listener);
        anchorEl.removeEventListener('blur', blurListener);
      };
    } else {
    }
  }, [anchorEl]);

  const credentialsAreFromMultipleDatabases = () => {
    const dbs = filterCredentials.map(credential => credential.databaseId);
    const uniqueDbs = new Set(dbs);
    return uniqueDbs.size > 1;
  };

  const handleBlurOnAnchorElement = (event: FocusEvent) => {
    if (anchorEl) {
      const rt = event.relatedTarget as HTMLElement;
      
      if (rt && rt.id === ContentScriptManager.INLINE_MENU_SHADOW_CONTAINER_ID) {
        
      } else {
        
        hideMenu(false);
      }
    }
  };

  const handleKeyDownInAnchorElement = (event: KeyboardEvent) => {
    if (anchorEl) {
      const inputElement = anchorEl as HTMLInputElement;
      

      if (event.key === 'Escape') {
        hideMenu();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        
        setOpen(true);
        setFocusFirstItem(true);
      } else {
        if (!props.isPasswordField) {
          const filtered = props.credentials.filter(credential => {
            return (
              credential.username.toLocaleUpperCase().indexOf(inputElement.value.toLocaleUpperCase()) !== -1 ||
              credential.title.toLocaleUpperCase().indexOf(inputElement.value.toLocaleUpperCase()) !== -1
            );
          });
          setFilteredCredentials(filtered);
        }
      }
    }
  };

  const handleCreateNewEntry = () => {
    hideMenu(false);
    props.onCreateNewEntry();
  };

  
  
  
  

  const handleUnlockDatabase = async (databaseUuid: string) => {
    pendingUnlockDatabases.add(databaseUuid);
    setPendingUnlockDatabases(new Set(pendingUnlockDatabases));

    await props.onUnlockDatabase(databaseUuid);

    refreshInlineMenu();
  };

  const hideMenu = (restoreFocus = true) => {
    
    setOpen(false);

    if (restoreFocus && anchorEl) {
      anchorEl.focus();
    }
  };

  const handleClickAway = (event: Event) => {

    if (event.target != anchorEl) {
      hideMenu(false);
    } else {
    }
  };

  const handleCredentialClick = (credential: AutoFillCredential) => {
    hideMenu(false);
    props.onFillWithCredential(credential);
  };

  const handleCopyUsername = (credential: AutoFillCredential) => {
    props.onCopyUsername(credential);
    hideMenu(false);
  };
  const handleCopyPassword = (credential: AutoFillCredential) => {
    props.onCopyPassword(credential);
    hideMenu(false);
  };
  const handleCopyTotp = (credential: AutoFillCredential) => {
    props.onCopyTotp(credential);
    hideMenu(false);
  };

  const darkTheme = createTheme({
    palette: { mode: 'dark' },
    components: {
      MuiPopover: {
        defaultProps: {
          container: props.shadowRootElement,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: props.shadowRootElement,
        },
      },
      MuiDialog: {
        defaultProps: {
          container: props.shadowRootElement,
        },
      },
      MuiModal: {
        defaultProps: {
          container: props.shadowRootElement,
        },
      },
    },
  });

  return (
    <CacheProvider value={props.cache}>
      <ThemeProvider theme={darkTheme}>
        <ClickAwayListener onClickAway={event => handleClickAway(event)}>
          <Popper
            sx={{ zIndex: '2147483640' }}
            open={open}
            anchorEl={anchorEl}
            placement="bottom-start"
            onKeyDown={event => {
              if (event.key === 'Escape') {
                hideMenu(true);
              }
            }}
          >
            <Paper sx={{ mt: '1px', borderRadius: '15px', maxWidth: '400px', overflow: 'hidden' }}>
              <MenuList autoFocusItem={focusFirstItem} disabledItemsFocusable={true}>
                {filterCredentials.length === 0 && props.unlockedDatabaseAvailable ? (
                  <MenuItem disabled dense>
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <SearchOff />
                      No Matching Entries Found
                    </Box>
                  </MenuItem>
                ) : (
                  ''
                )}
                {filterCredentials.map(credential =>
                  InlineMenuCredentialItem(
                    credential,
                    handleCredentialClick,
                    handleCopyUsername,
                    handleCopyPassword,
                    handleCopyTotp,
                    credentialsAreFromMultipleDatabases
                  )
                )}
                {props.unlockableDatabases.length !== 0 && props.unlockedDatabaseAvailable ? <Divider /> : ''}
                {props.unlockableDatabases.map(database => (
                  <MenuItem dense onClick={() => handleUnlockDatabase(database.uuid)} key={database.uuid}>
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {!pendingUnlockDatabases.has(database.uuid) ? (
                        <LockOpenOutlined htmlColor="orange" />
                      ) : (
                        <CircularProgress style={{ color: 'gray' }} size={20} />
                      )}

                      <>
                        {!pendingUnlockDatabases.has(database.uuid)
                          ? `Unlock ${database.nickName}`
                          : `${database.nickName} (Unlocking...)`}
                        {/* </Typography> */}{' '}
                      </>
                    </Box>
                  </MenuItem>
                ))}
                {props.showCreateNew &&
                (filterCredentials.length !== 0 ||
                  (filterCredentials.length === 0 && props.unlockedDatabaseAvailable) ||
                  props.unlockableDatabases.length !== 0) ? (
                  <Divider />
                ) : (
                  ''
                )}
                {!props.showCreateNew ? (
                  ''
                ) : (
                  <MenuItem dense onClick={handleCreateNewEntry} key="create-new-item-menu-item">
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Box
                        component="img"
                        sx={{
                          height: 24,
                          width: 24,
                          
                        }}
                        src={browser.runtime.getURL('assets/icons/app-icon-circle.png')}
                      />
                      Create New in Strongbox
                    </Box>
                  </MenuItem>
                )}
                {!props.showCreateNew && props.unlockableDatabases.length == 0 && filterCredentials.length === 0 ? (
                  <MenuItem disabled dense>
                    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <ExploreOffOutlined />
                      No AutoFill Enabled Databases
                    </Box>
                  </MenuItem>
                ) : (
                  ''
                )}
              </MenuList>
            </Paper>
          </Popper>
        </ClickAwayListener>
      </ThemeProvider>
    </CacheProvider>
  );
}
