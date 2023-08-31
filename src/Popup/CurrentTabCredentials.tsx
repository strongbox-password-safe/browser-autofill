import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { AutoFillCredential } from '../Messaging/Protocol/AutoFillCredential';
import { useEffect, useState } from 'react';
import CredentialsListItem from './CredentialsListItem';
import NoResultsFoundPopupComponent from './NoResultsFoundPopupComponent';
import { BackgroundManager } from '../Background/BackgroundManager';
import { ListSubheader } from '@mui/material';

interface CurrentTabCredentialsComponentProps {
  showToast: (message: string) => void;
}

function CurrentTabCredentialsComponent({ showToast }: CurrentTabCredentialsComponentProps) {
  const [grouped, setGrouped] = useState<Map<string, AutoFillCredential[]>>(new Map<string, AutoFillCredential[]>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [tabId, setTabId] = useState<number | undefined>();

  useEffect(() => {
    async function getCredentials() {
      try {
        const result = await getCredentialsForCurrentUrl();
        if (!result) {
          return;
        }

        const [tabId, creds] = result;

        const groupedBy = creds.reduce((r: Map<string, AutoFillCredential[]>, cred: AutoFillCredential) => {
          r.set(cred.databaseName, [...(r.get(cred.databaseName) || []), cred]);
          return r;
        }, new Map<string, AutoFillCredential[]>());

        

        setGrouped(groupedBy);

        setTabId(tabId);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    getCredentials();
  }, []);

  return (
    <List
      subheader={
        <ListSubheader
          component="div"
          key="parent-div-subheader"
          id="nested-list-subheader"
          sx={{ textAlign: 'center' }}
        >
          URL Matches
        </ListSubheader>
      }
      sx={{ minwidth: '400px', maxWidth: '400px', overflow: 'hidden', scrollbarWidth: 'none', mt: 0, pt: 0 }}
    >
      {!loading && tabId != undefined ? (
        grouped.size == 0 ? (
          <NoResultsFoundPopupComponent />
        ) : (
          <div key="parent-div">
            {[...grouped.keys()].map(databaseName => (
              <div key={databaseName}>
                <ListSubheader key={databaseName} sx={{ lineHeight: '20px' }}>
                  {databaseName}
                </ListSubheader>
                {(grouped.get(databaseName) || []).map(credential => (
                  <ListItem
                    sx={{ mb: '3px', mt: '3px' }}
                    disableGutters
                    disablePadding
                    button
                    key={credential.uuid}
                    onClick={() => onItemClicked(tabId, credential)}
                  >
                    <CredentialsListItem key={credential.uuid} credential={credential} showToast={showToast} />
                  </ListItem>
                ))}
              </div>
            ))}
          </div>
        )
      ) : (
        'Loading...'
      )}
    </List>
  );
}

async function getCredentialsForCurrentUrl(): Promise<[number, AutoFillCredential[]] | undefined> {
  

  const startTime = performance.now();

  const tab = await BackgroundManager.getCurrentTab();
  const url = tab ? tab.url : undefined;
  const tabId = tab?.id;

  if (!url || !tabId) {
    return;
  } else {
  }
  const response = await NativeAppApi.getInstance().credentialsForUrl(url);
  const endTime = performance.now();

  if (response != null) {
    const resultCount = response.results.length ?? 0;

    
    
    

    return [tabId, response.results];
  }
}

async function onItemClicked(tabId: number, credential: AutoFillCredential): Promise<void> {
  await BackgroundManager.getInstance().fillWithCredential(tabId, credential);

  window.close();
}

export default CurrentTabCredentialsComponent;
