import { Box, List, ListItem, ListSubheader, Typography } from '@mui/material';
import React, { useState } from 'react';
import { NativeAppApi } from '../Messaging/NativeAppApi';
import { DatabaseSummary } from '../Messaging/Protocol/DatabaseSummary';
import DatabaseListItem from './DatabaseListItem';

interface DatabasesListPopupComponentProps {
  showToast: (message: string) => void;
}

function DatabasesListPopupComponent({
  showToast
}: DatabasesListPopupComponentProps) {
  const [databases, setDatabases] = useState<DatabaseSummary[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>();

  React.useEffect(() => {
    async function getCurrentStatus() {

      const status = await NativeAppApi.getInstance().getStatus();
      if (status != null) {
        setDatabases(status.databases);
      } else {
        setError(true);
      }

      setLoading(false);
    }

    getCurrentStatus().catch(() => {
    });
  }, []);

  return (
    <List
      subheader={
        <ListSubheader component="div" id="nested-list-subheader" sx={{ textAlign: 'center' }}>
          Databases
        </ListSubheader>
      }
      sx={{ minWidth: '400px', minHeight: '100px', mt: 0, pt: 0 }}>
      {!loading && databases != undefined ? (
        databases.length ? (
          databases.map((database) => (
            <DatabaseListItem
              database={database}
              showToast={showToast}
              key={database.uuid}
            />))) :
          (
            <Box>
              <Box display="block">
                <Typography
                  variant="body1"
                  align="center"
                  
                  sx={{
                    textOverflow: 'ellipsis',
                    padding: 0,
                  }}
                >
                  No Databases
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                  sx={{
                    textOverflow: 'ellipsis',
                    padding: '5px',
                  }}
                >
                  You don't have any databases yet, why not add one to Strongbox?
                </Typography>
              </Box>
            </Box>
          )
      ) :
        ('Loading...')}
    </List >
  );
}

export default DatabasesListPopupComponent;
