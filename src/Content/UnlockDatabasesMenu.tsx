import * as React from 'react';

import { Box, CircularProgress, Menu, MenuItem } from '@mui/material';
import { LastKnownDatabasesItem } from '../Settings/Settings';

export interface UnlockDatabasesMenuProps {
  url: string;
  anchorEl: HTMLInputElement | null;
  open: boolean;
  setOpenMenu: (value: boolean) => void;
  notifyAction: (message: string) => void;
  handleUnlockDatabase: (databaseUuid: string) => void;
  unlockableDatabases: LastKnownDatabasesItem[];
  pendingUnlockDatabases: Set<string>;
  unlockedDatabaseAvailable: boolean;
}

export default function UnlockDatabasesMenu(props: UnlockDatabasesMenuProps) {
  return (
    <Menu
      id="hide-menu"
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={() => props.setOpenMenu(false)}
      sx={{ zIndex: '2147483642', height: '200px', minHeight: '400px', overflow: 'hidden' }}
      MenuListProps={{
        'aria-labelledby': 'hide-menu',
        sx: { p: 0 },
      }}
    >
      {props.unlockableDatabases.map(database => (
        <MenuItem dense onClick={() => props.handleUnlockDatabase(database.uuid)} key={database.uuid}>
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center', pt: '5px', pb: '5px' }}>
            {props.pendingUnlockDatabases.has(database.uuid) && <CircularProgress style={{ color: 'gray' }} size={20} />}
            <>
              {database.nickName}
            </>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );
}
