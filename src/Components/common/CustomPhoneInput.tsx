import { Box, InputLabel, Typography,  } from '@mui/material'
import 'react-phone-input-2/lib/style.css';
import  PhoneInput from "react-phone-input-2"

interface CustomPhoneInputProps {
  name: string;
  id: string;
  value: string;
  label?: string;
  onChange: (value: string) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  errorMessage?: string | boolean;
}
const CustomPhoneInput = ({ name, id, value,label,onChange,onBlur, errorMessage }: CustomPhoneInputProps) => {
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <InputLabel sx={{ fontSize: "14px", fontWeight: "500", color: "#032541" }}>
        {label}
      </InputLabel>
      <PhoneInput
        country={"ke"}
        value={value}
        onChange={onChange}
        inputProps={{
          name,
          id,
          onBlur: onBlur
        }}
        buttonStyle={{ height: "56px" }}
        inputStyle={{ width: "100%", height: "56px", borderRadius: "8px" }}
      />
      {errorMessage && (
        <Typography sx={{ fontSize: "12px", color: "#dc3545" }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default CustomPhoneInput