import * as React from 'react';
import { Alert, Snackbar } from '@mui/material';

export interface NotificationToastProps {
  message: string;
  handleClose: () => void;
}

export default function NotificationToast(props: NotificationToastProps) {
  const handleCloseSnackBar = () => {
    props.handleClose();
  };

  return (
    <Snackbar open={true} autoHideDuration={3000} onClose={handleCloseSnackBar}>
      <Alert onClose={handleCloseSnackBar} severity="success" sx={{ width: '100%', marginTop: '20px' }}>
        {props.message}
      </Alert>
    </Snackbar>
  );
}
