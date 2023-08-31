import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Collapse,
  createTheme,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  Icon,
  IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import {
  AddCircle,
  Close,
  ExpandMore,
  Folder,
  Home,
  Lock,
  LockOpen,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { CreateEntryRequest } from '../Messaging/Protocol/CreateEntryRequest';
import { CreateEntryResponse } from '../Messaging/Protocol/CreateEntryResponse';
import { DatabaseSummary } from '../Messaging/Protocol/DatabaseSummary';
import { GetGroupsRequest } from '../Messaging/Protocol/GetGroupsRequest';
import { GetGroupsResponse } from '../Messaging/Protocol/GetGroupsResponse';
import { GroupSummary } from '../Messaging/Protocol/GroupSummary';
import { GetNewEntryDefaultsRequest } from '../Messaging/Protocol/GetNewEntryDefaultsRequest';
import { GetNewEntryDefaultsResponse } from '../Messaging/Protocol/GetNewEntryDefaultsResponse';
import { GeneratePasswordRequest } from '../Messaging/Protocol/GeneratePasswordRequest';
import { GeneratePasswordResponse } from '../Messaging/Protocol/GeneratePasswordResponse';
import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import { StrongboxColours } from '../StrongboxColours';
import browser from 'webextension-polyfill';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { CacheProvider, EmotionCache } from '@emotion/react';

export interface CreateNewEntryDialogProps {
  getStatus: () => Promise<GetStatusResponse | null>;
  getNewEntryDefaults: (request: GetNewEntryDefaultsRequest) => Promise<GetNewEntryDefaultsResponse | null>;
  generatePassword: (request: GeneratePasswordRequest) => Promise<GeneratePasswordResponse | null>;
  getGroups: (request: GetGroupsRequest) => Promise<GetGroupsResponse | null>;
  faviconUrl: string | null;
  onCreate: (details: CreateEntryRequest) => Promise<CreateEntryResponse | null>;
  onCreatedItem: (credential: AutoFillCredential) => void;
  unlockDatabase: (uuid: string) => Promise<UnlockResponse | null>;
  shadowRootElement: HTMLElement;
  cache: EmotionCache;
  favIconBase64: string | null;
}

export default function CreateNewEntryDialog(props: CreateNewEntryDialogProps) {
  const [open, setOpen] = React.useState<boolean>(true);
  const [saveInExpanded, setSaveInExpanded] = React.useState<boolean>(false);
  const [unlockWaitSpinnerOpen, setUnlockWaitSpinnerOpen] = React.useState<boolean>(false);
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastIsError, setToastIsError] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string>('');
  const [selectedDatabaseIdx, setSelectedDatabaseIdx] = React.useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = React.useState<string>('');
  const [databases, setDatabases] = React.useState<DatabaseSummary[]>([]);
  const [groups, setGroups] = React.useState<GroupSummary[]>([]);
  const [username, setUsername] = React.useState<string>('Loading...');
  const [mostPopularUsernames, setMostPopularUsernames] = React.useState<string[]>([]);
  const [title, setTitle] = React.useState<string>(document.title);
  const [password, setPassword] = React.useState<string>('Loading...');
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    loadDatabasesAtStartup().catch(error => {
      showErrorToast('Could not load databases!');
    });
  }, []);

  React.useEffect(() => {
    refreshDefaults().catch(error => {
      showErrorToast('Could not load defaults!');
    });
  }, [databases, selectedDatabaseIdx]);

  React.useEffect(() => {
    refreshGroups().catch(error => {
      showErrorToast('Could not refresh groups!');
    });
  }, [databases, selectedDatabaseIdx]);

  const handleGenerateNewPassword = async () => {
    const req = new GeneratePasswordRequest();
    const resp = await props.generatePassword(req);

    if (resp === null) {
      showErrorToast('Could Not Generate Password');
    } else {
      setPassword(resp.password);
      

      if (!showPassword) {
        setShowPassword(true);
        setTimeout(() => {
          setShowPassword(false);
        }, 3000);
      }
    }
  };

  const handleUnlockRequest = async () => {
    if (selectedDatabaseIdx == null || !currentlySelectedDatabase()?.locked) {
      return;
    }


    const uuid = databases[selectedDatabaseIdx].uuid;
    const resp = await props.unlockDatabase(uuid);

    if (resp === null) {
      showErrorToast('Could not Unlock Database');
    } else {
      setUnlockWaitSpinnerOpen(true);
      pollForUnlockStatusChanged(uuid);
    }
  };

  async function pollForUnlockStatusChanged(uuid: string, iteration = 0) {
    const resp = await props.getStatus();

    if (resp != null) {
      const database = resp.databases.find(database => database.uuid === uuid);
      if (database && !database.locked) {
        const dbs = resp.databases;
        const afDbs = dbs.filter(database => database.autoFillEnabled);

        setDatabases(afDbs);
        const unlockedIdx = afDbs.findIndex(database => database.uuid === uuid);
        setSelectedDatabaseIdx(unlockedIdx != -1 ? unlockedIdx : afDbs.length > 0 ? 0 : null);
        setSaveInExpanded(unlockedIdx === -1);
        setUnlockWaitSpinnerOpen(false);

        return;
      }
    } else {
      showErrorToast('Could not get unlock status in poll!');
      setUnlockWaitSpinnerOpen(false);
      return;
    }


    

    const checkIntervalMs = 250;
    const checkForSecs = 20;
    const maxIterations = (1000 / checkIntervalMs) * checkForSecs;

    if (iteration < maxIterations) {
      
      setTimeout(() => {
        pollForUnlockStatusChanged(uuid, iteration + 1);
      }, checkIntervalMs);
    } else {
      setUnlockWaitSpinnerOpen(false);
    }
  }

  const loadDatabasesAtStartup = async () => {
    

    const status = await props.getStatus();

    if (status === null) {
      showErrorToast('Could Not Connect to Strongbox');
      setDatabases([]);
      setSelectedDatabaseIdx(null);
      setSaveInExpanded(true);
    } else {
      const dbs = status.databases;
      const afDbs = dbs.filter(database => database.autoFillEnabled);

      setDatabases(afDbs);

      const unlockedIdx = afDbs.findIndex(database => !database.locked);
      setSelectedDatabaseIdx(unlockedIdx != -1 ? unlockedIdx : afDbs.length > 0 ? 0 : null);

      setSaveInExpanded(unlockedIdx === -1);
    }
  };

  const refreshDefaults = async () => {
    if (selectedDatabaseIdx == null || currentlySelectedDatabase()?.locked) {
      setUsername('Loading...');
      setPassword('Loading...');
      setMostPopularUsernames([]);
    } else {
      

      const req = new GetNewEntryDefaultsRequest();
      req.databaseId = databases[selectedDatabaseIdx].uuid;
      const resp = await props.getNewEntryDefaults(req);

      if (resp === null || resp.error) {
        showErrorToast('Error getting defaults');
        setUsername('Loading...');
        setPassword('Loading...');
        setMostPopularUsernames([]);
      } else {
        setUsername(resp.username ?? '');
        setPassword(resp.password ?? '');
        setMostPopularUsernames(resp.mostPopularUsernames ?? []);
      }
    }
  };

  const refreshGroups = async () => {
    if (selectedDatabaseIdx == null || currentlySelectedDatabase()?.locked) {
      
      setGroups([]);
      setSelectedGroup('');
      return;
    } else {
      

      const req = new GetGroupsRequest();
      req.databaseId = databases[selectedDatabaseIdx].uuid;
      const grps = await props.getGroups(req);

      if (grps === null || grps.error) {
        showErrorToast('Could not refresh Groups');
        setGroups([]);
        setSelectedGroup('');
      } else {
        setGroups(grps.groups);
        setSelectedGroup(grps.groups.length == 0 ? '' : grps.groups[0].uuid);
      }
    }
  };

  const showErrorToast = (message: string, duration = 5000) => {
    setToastOpen(true);
    setToastIsError(true);
    setToastMessage(message);

    setTimeout(() => {
      setToastOpen(false);
    }, duration);
  };

  const handleCreate = async () => {
    if (!isValidForSubmission() || selectedDatabaseIdx === null) {
      showErrorToast('There is not a valid new entry.');
      return;
    }

    const selectedDatabase = databases[selectedDatabaseIdx];

    const details = new CreateEntryRequest();

    details.databaseId = selectedDatabase.uuid;
    details.groupId = selectedGroup;
    details.icon = props.favIconBase64;
    details.title = title;
    details.username = username;
    details.password = password;
    details.url = document.location.href;

    const result = await props.onCreate(details);

    if (result === null || result.error) {
      showErrorToast('Could not create new entry. error=[' + result?.error + '');
    } else {
      setOpen(false);

      
      if (result.credential != null) {
        props.onCreatedItem(result.credential);
      } else {
        const cred = new AutoFillCredential();
        cred.username = username;
        cred.password = password;
        props.onCreatedItem(cred);
      }
    }
  };

  const isValidForSubmission = () => {
    return hasSelectedValidUnlockedDatabase();
  };

  const handleChangeDatabase = (event: SelectChangeEvent) => {
    
    setSelectedDatabaseIdx(+event.target.value);
  };

  const handleChangeGroup = (event: SelectChangeEvent) => {
    
    setSelectedGroup(event.target.value);
  };

  const handleClose = (event: never, reason: string) => {
    if (reason && reason == 'backdropClick') {
      return;
    }

    closeDialog();
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const currentlySelectedDatabase = () => {
    return selectedDatabaseIdx === null ? null : databases[selectedDatabaseIdx];
  };

  const hasSelectedValidUnlockedDatabase = () => {
    return selectedDatabaseIdx === null ? false : !databases[selectedDatabaseIdx].locked;
  };

  const handleUsernameChange = (event: any, newInputValue: string) => {
    setUsername(newInputValue);
  };

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
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
        <Dialog
          open={open}
          disablePortal
          PaperProps={{
            style: { borderRadius: 15, zIndex: 2147483640 },
          }}
          sx={{ p: '3px' }}
          fullWidth
          maxWidth="xs"
          onClose={handleClose}
          onKeyDown={async event => {
            if (event.metaKey && event.key === 'Enter') {
              await handleCreate();
            }
          }}
        >
          <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={unlockWaitSpinnerOpen}>
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <CircularProgress color="inherit" />
              <Typography variant="subtitle1">Please Unlock Your Database...</Typography>
            </Box>
          </Backdrop>
          <DialogTitle align="center" sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Box
                component="img"
                sx={{
                  height: 24,
                  width: 24,
                  
                }}
                src={browser.runtime.getURL('assets/icons/app-icon-circle.png')}
              />
              <Typography color="text.secondary" variant="body1">
                Create New Entry
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers={true} sx={{ zIndex: '2147483641' }}>
            <Collapse in={toastOpen}>
              <Alert
                severity={toastIsError ? 'error' : 'success'}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setToastOpen(false);
                    }}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                <AlertTitle>{toastIsError ? 'Error' : 'Success'}</AlertTitle>
                {toastMessage}
              </Alert>
            </Collapse>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Box display={hasSelectedValidUnlockedDatabase() ? '' : 'none'}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                    {props.faviconUrl ? (
                      <Box
                        component="img"
                        id="create-new-entry-icon"
                        sx={{
                          height: 32,
                          width: 32,
                        }}
                        src={props.faviconUrl}
                      />
                    ) : (
                      <Lock
                        sx={{
                          height: 32,
                          width: 32,
                        }}
                        htmlColor={StrongboxColours.niceBlue}
                      />
                    )}
                    <TextField
                      autoFocus
                      label="Title"
                      fullWidth
                      value={title}
                      error={title.length === 0 ? true : false}
                      
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setTitle(event.target.value);
                      }}
                    ></TextField>
                  </Box>
                  <FormControl variant="outlined" fullWidth>
                    <Autocomplete
                      freeSolo
                      selectOnFocus
                      autoHighlight
                      autoComplete
                      handleHomeEndKeys
                      inputValue={username}
                      onInputChange={handleUsernameChange}
                      options={mostPopularUsernames}
                      renderInput={params => (
                        <TextField {...params} label="Username" error={username.length === 0 ? true : false} />
                      )}
                    />
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                      <OutlinedInput
                        value={password}
                        error={password.length === 0 ? true : false}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          setPassword(event.target.value);
                        }}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                      />
                    </FormControl>
                    <IconButton onClick={handleGenerateNewPassword} sx={{ height: '40px', width: '40px' }}>
                      <Refresh color="primary" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <Accordion
                sx={{ borderRadius: '5px' }}
                expanded={saveInExpanded}
                onChange={(e, newExpanded) => {
                  setSaveInExpanded(newExpanded || !hasSelectedValidUnlockedDatabase());
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ color: 'text.secondary', pr: '20px' }} variant="body1" fontWeight="light">
                    {hasSelectedValidUnlockedDatabase() ? 'Save In' : 'Save In...'}
                  </Typography>
                  <Typography variant="body1">
                    {hasSelectedValidUnlockedDatabase() ? currentlySelectedDatabase()?.nickName : ''}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }} component="form">
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '4px',
                        alignItems: 'center',
                        justifyItems: 'center',
                        flexGrow: 1,
                      }}
                    >
                      <FormControl fullWidth>
                        <InputLabel>Database</InputLabel>
                        <Select
                          MenuProps={{
                            style: { zIndex: 2147483641 }, 
                          }}
                          value={
                            databases.length === 0
                              ? 'no-available-databases'
                              : selectedDatabaseIdx !== null
                              ? selectedDatabaseIdx.toString()
                              : ''
                          }
                          label="Database"
                          fullWidth
                          disabled={databases.length === 0}
                          onChange={handleChangeDatabase}
                        >
                          {databases.length > 0 ? (
                            databases.map((database, idx) => (
                              <MenuItem value={idx.toString()} key={idx}>
                                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                  {database.locked ? <Lock color="error" /> : <LockOpen />}
                                  <Box>{database.locked ? database.nickName + ' (Locked)' : database.nickName}</Box>
                                </div>
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem key="no-available-databases" value="no-available-databases" disabled>
                              No AutoFill Databases Available
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      {currentlySelectedDatabase()?.locked ? (
                        <IconButton onClick={handleUnlockRequest}>
                          <LockOpen color="primary" />
                        </IconButton>
                      ) : (
                        ''
                      )}
                    </Box>
                    <Box display={hasSelectedValidUnlockedDatabase() ? '' : 'none'}>
                      <FormControl fullWidth>
                        <InputLabel>Group</InputLabel>
                        <Select
                          MenuProps={{
                            style: { zIndex: 2147483641 }, 
                          }}
                          value={selectedGroup}
                          label="Group"
                          fullWidth
                          
                          sx={
                            {
                              
                              
                              
                              
                            }
                          }
                          onChange={handleChangeGroup}
                        >
                          {groups.map((group, idx) => (
                            <MenuItem value={group.uuid} key={group.uuid}>
                              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                {idx == 0 ? <Home /> : <Folder />}
                                {idx == 0 ? (
                                  <Box sx={{ fontStyle: 'italic' }}>{group.title}</Box>
                                ) : (
                                  <Box>{group.title}</Box>
                                )}
                              </div>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexGrow: '1' }}>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={async () => {
                  handleCreate();
                }}
                disabled={!isValidForSubmission()}
              >
                Create (⌘⏎)
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
