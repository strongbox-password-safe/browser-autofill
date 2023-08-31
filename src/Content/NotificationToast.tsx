import * as React from 'react';
import { Alert, createTheme, Portal, Snackbar, ThemeProvider } from '@mui/material';
import { CacheProvider, EmotionCache } from '@emotion/react';

export interface NotificationToastProps {
  shadowRootElement: HTMLElement;
  cache: EmotionCache;
}

export default function NotificationToast(props: NotificationToastProps) {
  const [snackBarOpen, setSnackBarOpen] = React.useState<boolean>(true);

  const handleCloseSnackBar = () => {
    setSnackBarOpen(false);
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
        <Snackbar open={snackBarOpen} autoHideDuration={3000} onClose={handleCloseSnackBar}>
          <Alert onClose={handleCloseSnackBar} severity="success" sx={{ width: '100%' }}>
            Successfully Created New Entry
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </CacheProvider>
  );
}
