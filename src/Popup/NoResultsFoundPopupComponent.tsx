import { Typography, Box, Stack, Paper } from '@mui/material';
import React from 'react';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function NoResultsFoundPopupComponent() {
  const [t] = useTranslation('global');

  return (
    <Paper>
      <Stack direction="column" justifyContent="center" alignItems="center" minWidth="200px" spacing={1} sx={{ m: 0 }}>
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
              p: 0,
            }}
          >
            {t('no-results-found-popup-component.title')}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{
              textOverflow: 'ellipsis',
              p: 2,
            }}
          >
            {t('no-results-found-popup-component.message')}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default NoResultsFoundPopupComponent;
