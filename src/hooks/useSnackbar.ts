import { createContext, useContext } from 'react';
import { type SnackbarContextType } from '../types/snackbar';

export const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
  hideSnackbar: () => {},
});

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};