import React from 'react';
import { Box, TextField, InputLabel, Typography} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CustomDatePickerProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  fullWidth?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ label, value, onChange, error = false, helperText, required = false, disabled = false, minDate, maxDate, fullWidth = true }) => {
  const dateValue = value ? new Date(value) : null;
  const handleDateChange = (newDate: Date | null) => {
    const isoString = newDate ? newDate.toISOString().split('T')[0] : null;
    onChange(isoString);
  };

  return (
    <Box sx={{ display:"flex",gap:"4px", flexDirection:"column"}}>
    <InputLabel sx={{ fontSize:"14px", fontWeight:"500", color:"#032541"}}>{label}</InputLabel>
    <LocalizationProvider  dateAdapter={AdapterDateFns}>
      <DatePicker
        value={dateValue}
        onChange={handleDateChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        renderInput={(params) => (
          <TextField
            sx={{ borderRadius:"8px"}}
            {...params}
            fullWidth={fullWidth}
            error={error}
            helperText={helperText}
            required={required}
          />
        )}
      />
    </LocalizationProvider>
     { error && <Typography sx={{ fontSize:"12px", color:"#dc3545"}}>{helperText}</Typography>}
    </Box>
  );
};

export default CustomDatePicker;