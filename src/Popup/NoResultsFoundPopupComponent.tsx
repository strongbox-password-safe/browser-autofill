import { Typography, Box, Icon, IconButton, Stack } from '@mui/material';
import React from 'react';
import { Search } from '@mui/icons-material';

function NoResultsFoundPopupComponent() {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      minWidth='400px'
      spacing={0}
    >
      <Box display="block">
        <Search
          color="disabled"
          sx={{
            fontSize: 60,
          }}
        />
      </Box>
      <Box>
        <Typography
          variant="h6"
          align="center"
          sx={{
            textOverflow: 'ellipsis',
            padding: 0,
          }}
        >
          No Matches
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
          Strongbox could not find any matching entries for this website
        </Typography>
      </Box>
    </Stack>
  );
}

export default NoResultsFoundPopupComponent;
