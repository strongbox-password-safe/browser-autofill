import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog, { DialogProps } from '@mui/material/Dialog';
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
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { AddCircle, Close, ExpandMore, Folder, Home, Lock, LockOpen, Refresh, Visibility, VisibilityOff } from '@mui/icons-material';
import { CreateEntryRequest } from '../Messaging/Protocol/CreateEntryRequest';
import { CreateEntryResponse } from '../Messaging/Protocol/CreateEntryResponse';
import { DatabaseSummary } from '../Messaging/Protocol/DatabaseSummary';
import { GetGroupsRequest } from '../Messaging/Protocol/GetGroupsRequest';
import { GetGroupsResponse } from '../Messaging/Protocol/GetGroupsResponse';
import { GroupSummary } from '../Messaging/Protocol/GroupSummary';
import { GetNewEntryDefaultsRequest } from '../Messaging/Protocol/GetNewEntryDefaultsRequest';
import { GeneratePasswordV2Response, PasswordAndStrength } from '../Messaging/Protocol/GeneratePasswordV2Response';

import { GetStatusResponse } from '../Messaging/Protocol/GetStatusResponse';
import { StrongboxColours } from '../StrongboxColours';
import browser from 'webextension-polyfill';
import { UnlockResponse } from '../Messaging/Protocol/UnlockResponse';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { useTranslation } from 'react-i18next';
import { SettingsStore } from '../Settings/SettingsStore';
import { GetPasswordAndStrengthRequest } from '../Messaging/Protocol/GetPasswordAndStrengthRequest';
import { GetPasswordAndStrengthResponse } from '../Messaging/Protocol/GetPasswordAndStrengthResponse';
import { Utils } from '../Utils';
import { GetNewEntryDefaultsResponseV2 } from '../Messaging/Protocol/GetNewEntryDefaultsResponseV2';
import { useCustomStyle } from '../Contexts/CustomStyleContext';

export interface CreateNewEntryDialogProps {
  title: string;
  url: string | null;
  favIconUrl: string | null;
  favIconBase64: string | null;
  getStatus: () => Promise<GetStatusResponse | null>;
  getNewEntryDefaultsV2: (request: GetNewEntryDefaultsRequest) => Promise<GetNewEntryDefaultsResponseV2 | null>;
  generatePasswordV2: () => Promise<GeneratePasswordV2Response | null>;
  getPasswordStrength: (request: GetPasswordAndStrengthRequest) => Promise<GetPasswordAndStrengthResponse | null>;
  getGroups: (request: GetGroupsRequest) => Promise<GetGroupsResponse | null>;
  onCreate: (details: CreateEntryRequest) => Promise<CreateEntryResponse | null>;
  onCreatedItem: (credential: AutoFillCredential, message: string) => void;
  unlockDatabase: (uuid: string) => Promise<UnlockResponse | null>;
  handleClose: () => void;
  notifyAction: (message: string) => void;
}

export default function CreateNewEntryDialog(props: CreateNewEntryDialogProps) {
  const [t] = useTranslation('global');
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
  const [username, setUsername] = React.useState<string>(t('general.loading'));
  const [mostPopularUsernames, setMostPopularUsernames] = React.useState<string[]>([]);
  const [title, setTitle] = React.useState<string>(props.title);
  const [password, setPassword] = React.useState<string>(t('general.loading'));
  const [passwordAndStrength, setPasswordAndStrength] = React.useState<PasswordAndStrength | null>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [url, setUrl] = React.useState<string>(new URL(props.url ?? String()).origin);
  const { sizeHandler } = useCustomStyle();

  React.useEffect(() => {
    loadDatabasesAtStartup().catch(error => {
      showErrorToast(t('create-new-entry-dialog.could-not-load-databases'));
    });
  }, []);

  React.useEffect(() => {
    refreshDefaults().catch(error => {
      showErrorToast(t('create-new-entry-dialog.could-not-load-defaults'));
    });
  }, [databases, selectedDatabaseIdx]);

  React.useEffect(() => {
    refreshGroups().catch(error => {
      showErrorToast(t('create-new-entry-dialog.could-not-refresh-groups'));
    });
  }, [databases, selectedDatabaseIdx]);

  const handleGenerateNewPassword = async () => {
    const resp = await props.generatePasswordV2();

    if (resp === null) {
      showErrorToast(t('create-new-entry-dialog.could-not-generate-password'));
    } else {
      setPassword(resp.password.password);
      setPasswordAndStrength(resp.password);
    }
  };

  const persistSelectedGroup = async (newSelectedGroup: string) => {
    if (selectedDatabaseIdx === null) {
      return;
    }

    const stored = await SettingsStore.getSettings();
    stored.lastSelectedNewEntryGroupUuidForDatabase.set(databases[selectedDatabaseIdx].uuid, newSelectedGroup);
    SettingsStore.setSettings(stored);
  };

  const handleUnlockRequest = async () => {
    if (selectedDatabaseIdx == null || !currentlySelectedDatabase()?.locked) {
      return;
    }


    setUnlockWaitSpinnerOpen(true);
    const uuid = databases[selectedDatabaseIdx].uuid;
    const resp = await props.unlockDatabase(uuid);

    if (resp?.success) {
      await refreshStatus(uuid);
    } else {
      showErrorToast(t('create-new-entry-dialog.could-not-unlock-database'));
    }

    setUnlockWaitSpinnerOpen(false);
  };

  async function refreshStatus(uuid: string) {
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
      }
    } else {
      showErrorToast(t('create-new-entry-dialog.could-not-refresh-status'));
    }

    return;
  }

  const loadDatabasesAtStartup = async () => {
    

    const status = await props.getStatus();

    if (status === null) {
      showErrorToast(t('create-new-entry-dialog.could-not-connect-to-strongbox'));
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
      setMostPopularUsernames([]);
    } else {
      

      const req = new GetNewEntryDefaultsRequest();
      req.databaseId = databases[selectedDatabaseIdx].uuid;
      const resp = await props.getNewEntryDefaultsV2(req);

      if (resp === null || resp.error) {
        showErrorToast(t('create-new-entry-dialog.error-getting-defaults'));
        setMostPopularUsernames([]);
      } else {
        setUsername(resp.username ?? '');
        setPassword(resp.password?.password ?? '');
        setPasswordAndStrength(resp.password);
        setMostPopularUsernames(resp.mostPopularUsernames ?? []);
      }
    }
  };

  const refreshGroups = async () => {
    if (selectedDatabaseIdx == null || currentlySelectedDatabase()?.locked) {
      
      setGroups([]);
      setSelectedGroup(String());
      return;
    } else {
      

      const req = new GetGroupsRequest();
      req.databaseId = databases[selectedDatabaseIdx].uuid;
      const grps = await props.getGroups(req);

      if (grps === null || grps.error) {
        showErrorToast(t('create-new-entry-dialog.could-not-refresh-groups'));
        setGroups([]);
        setSelectedGroup(String());
      } else {
        setGroups(grps.groups);

        const stored = await SettingsStore.getSettings();

        const lastSelectedNewEntryGroupUuid = stored.lastSelectedNewEntryGroupUuidForDatabase.get(currentlySelectedDatabase()?.uuid || String());

        if (lastSelectedNewEntryGroupUuid && grps.groups.some(g => g.uuid == lastSelectedNewEntryGroupUuid)) {
          setSelectedGroup(lastSelectedNewEntryGroupUuid);
        } else {
          setSelectedGroup(grps.groups.length == 0 ? '' : grps.groups[0].uuid);
        }
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
      showErrorToast(t('create-new-entry-dialog.there-is-not-a-valid-new-entry'));
      return;
    }

    const selectedDatabase = databases[selectedDatabaseIdx];

    const details = new CreateEntryRequest();

    details.databaseId = selectedDatabase.uuid;
    details.groupId = selectedGroup;
    details.icon = includeFavIconForNewEntries() ? props.favIconBase64 : null;
    details.title = title;
    details.username = username;
    details.password = password;
    details.url = url;

    const result = await props.onCreate(details);

    if (result === null || result.error) {
      showErrorToast(t('create-new-entry-dialog.could-not-create-new-entry', { error: result?.error }));
    } else {
      setOpen(false);

      
      const message = t('notification-toast.successfully-created-new-entry');
      if (result.credential != null) {
        props.onCreatedItem(result.credential, message);
      } else {
        const cred = new AutoFillCredential();
        cred.username = username;
        cred.password = password;
        props.onCreatedItem(cred, message);
      }
    }
  };

  const isValidForSubmission = () => {
    return hasSelectedValidUnlockedDatabase();
  };

  const handleChangeDatabase = (event: SelectChangeEvent) => {
    
    setSelectedDatabaseIdx(+event.target.value);
  };

  const handleChangeGroup = async (event: SelectChangeEvent) => {
    
    const newSelectedGroup = event.target.value;
    setSelectedGroup(newSelectedGroup);
    await persistSelectedGroup(newSelectedGroup);
  };

  const handleClose = () => {
    props.handleClose();
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

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const includeFavIconForNewEntries = (): boolean => {
    return currentlySelectedDatabase()?.includeFavIconForNewEntries || false;
  };

  return (
    <Dialog
      open={open}
      disablePortal
      PaperProps={{
        style: { borderRadius: 15, zIndex: 2147483640 },
      }}
      sx={{ p: '3px' }}
      fullWidth
      maxWidth={sizeHandler.getCreatenewEntryDialogMaxWidth() as DialogProps['maxWidth']}
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
          <Typography variant="subtitle1">{t('create-new-entry-dialog.please-unlock-your-database')}</Typography>
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
            {t('create-new-entry-dialog.title')}
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
                {props.favIconUrl && includeFavIconForNewEntries() ? (
                  <Box
                    component="img"
                    id="create-new-entry-icon"
                    sx={{
                      height: 32,
                      width: 32,
                    }}
                    src={props.favIconUrl}
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
                  label={t('create-new-entry-dialog.credential-title')}
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
                    <TextField
                      {...params}
                      label={t('create-new-entry-dialog.username')}
                      error={username.length === 0 ? true : false}
                      InputLabelProps={{ children: t('create-new-entry-dialog.username') }}
                    />
                  )}
                />
              </FormControl>
              <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="outlined-adornment-password">{t('create-new-entry-dialog.password')}</InputLabel>
                  <OutlinedInput
                    value={password}
                    error={password.length === 0 ? true : false}
                    onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                      const newPassword = event.target.value;
                      setPassword(newPassword);

                      const details: GetPasswordAndStrengthRequest = { password: newPassword };
                      const result = await props.getPasswordStrength(details);

                      if (!result) {
                        return;
                      }

                      const passwordAndStrength: PasswordAndStrength = {
                        password: newPassword,
                        strength: result.strength,
                      };

                      setPasswordAndStrength(passwordAndStrength);
                    }}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label={t('create-new-entry-dialog.password')}
                  />
                </FormControl>
                <IconButton onClick={handleGenerateNewPassword} sx={{ height: '40px', width: '40px' }}>
                  <Refresh color="primary" />
                </IconButton>
              </Box>

              {password.trim() !== String() && (
                <Box sx={{ textAlign: 'right', marginBottom: '5px' }}>
                  <LinearProgress
                    sx={{
                      margin: '5px',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: Utils.getEntropyColor(passwordAndStrength?.strength.entropy || 0),
                      },
                    }}
                    variant="determinate"
                    value={Utils.getEntropyPercent(passwordAndStrength?.strength.entropy || 0)}
                  />
                  <Typography sx={{ p: '8px' }} variant="caption" fontWeight="light">
                    {passwordAndStrength?.strength.summaryString}
                  </Typography>
                </Box>
              )}

              <FormControl variant="outlined" fullWidth>
                <InputLabel>{t('create-new-entry-dialog.url')}</InputLabel>
                <OutlinedInput onChange={handleUrlChange} value={url} error={url.length === 0 ? true : false} type="text" label={t('create-new-entry-dialog.url')} />
              </FormControl>
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
                {hasSelectedValidUnlockedDatabase() ? t('create-new-entry-dialog.save-in') : `${t('create-new-entry-dialog.save-in')}...`}
              </Typography>
              <Typography variant="body1">{hasSelectedValidUnlockedDatabase() ? currentlySelectedDatabase()?.nickName : ''}</Typography>
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
                    <InputLabel>{t('create-new-entry-dialog.database')}</InputLabel>
                    <Select
                      MenuProps={{
                        style: { zIndex: 2147483641 }, 
                      }}
                      value={databases.length === 0 ? 'no-available-databases' : selectedDatabaseIdx !== null ? selectedDatabaseIdx.toString() : ''}
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
                          {t('create-new-entry-dialog.no-autoFill-databases-available')}
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
                    <InputLabel>{t('create-new-entry-dialog.group')}</InputLabel>
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
                            {idx == 0 ? <Box sx={{ fontStyle: 'italic' }}>{group.title}</Box> : <Box>{group.title}</Box>}
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
          <Button onClick={handleClose}>{t('general.cancel')}</Button>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={async () => {
              handleCreate();
            }}
            disabled={!isValidForSubmission()}
          >
            {t('general.create')} (⌘⏎)
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
