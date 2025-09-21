import React, { useCallback, useState } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';
import { SnackbarContext } from '../../hooks/useSnackbar';
import { type SnackbarProviderProps, type SnackbarState } from '../../types/snackbar';

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children, autoHideDuration = 6000 }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({open: false, message: '', severity: 'info' });
  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleClose = useCallback((event: React.SyntheticEvent | Event,reason?: string) => {
    if (reason === 'clickaway') return;
    hideSnackbar();
  }, [hideSnackbar]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};