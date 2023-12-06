import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { blue } from '@mui/material/colors';
import { ListSubheader } from '@mui/material';
import NoResultsFoundPopupComponent from '../Popup/NoResultsFoundPopupComponent';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import CredentialsListItem from '../Popup/CredentialsListItem';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const emails = ['username@gmail.com', 'user02@gmail.com'];

const darkTheme = createTheme({ palette: { mode: 'dark' } });

export interface SimpleDialogProps {
  open: boolean;
  groupedCredentials: Map<string, AutoFillCredential[]>;
  selectedValue: string;
  onClose: (value: string) => void;
  fillCredential: (credential: AutoFillCredential) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, groupedCredentials, selectedValue, open, fillCredential } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  async function handleListItemClick(credential: AutoFillCredential): Promise<void> {
    fillCredential(credential);
    onClose('email');
  }
  const showToast = () => {
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Select Credential</DialogTitle>

        <List sx={{ minwidth: '400px', maxWidth: '400px', overflow: 'hidden', scrollbarWidth: 'none', mt: 0, pt: 0 }}>
          {groupedCredentials.size == 0 ? (
            <NoResultsFoundPopupComponent />
          ) : (
            <div>
              {[...groupedCredentials.keys()].map(databaseName => (
                <div>
                  <ListSubheader key={databaseName} sx={{ lineHeight: '20px' }}>
                    {databaseName}
                  </ListSubheader>
                  {(groupedCredentials.get(databaseName) || []).map(credential => (
                    <ListItem
                      sx={{ mb: '3px', mt: '3px' }}
                      disableGutters
                      disablePadding
                      button
                      key={credential.uuid}
                      onClick={() => handleListItemClick(credential)}
                    >
                      <CredentialsListItem
                        credential={credential}
                        showToast={showToast}
                        onClick={() => {
                          return;
                        }}
                        selected={false}
                      />
                    </ListItem>
                  ))}
                </div>
              ))}
            </div>
          )}
        </List>

        {/* <List sx={{ pt: 0 }}>
                {emails.map((email) => (
                    <ListItem button onClick={() => handleListItemClick(email)} key={email}>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                                <PersonIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={email} />
                    </ListItem>
                ))}
                <ListItem autoFocus button onClick={() => handleListItemClick('addAccount')}>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Add account" />
                </ListItem>
            </List> */}
      </Dialog>
    </ThemeProvider>
  );
}

export interface SelectCredentialComponentProps {
  groupedCredentials: Map<string, AutoFillCredential[]>;
  fillCredential: (credential: AutoFillCredential) => void;
}

export default function SelectCredentialComponent(props: SelectCredentialComponentProps) {
  const [open, setOpen] = React.useState(true);
  const [selectedValue, setSelectedValue] = React.useState(emails[1]);

  const handleClose = (value: string) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <div>
      <SimpleDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
        groupedCredentials={props.groupedCredentials}
        fillCredential={props.fillCredential}
      />
    </div>
  );
}
