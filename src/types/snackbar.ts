import { type AlertColor } from "@mui/material";
import { type ReactNode } from "react";

export interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  hideSnackbar: () => void;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface SnackbarProviderProps {
  children: ReactNode;
  autoHideDuration?: number;
}
