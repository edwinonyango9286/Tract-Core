import { Box, TextField, type TextFieldProps, InputLabel, Typography } from "@mui/material";
import type { ReactNode } from "react";

type CustomVariant = 'outlined' | 'filled' | 'standard';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  onChange?: TextFieldProps['onChange'];
  onBlur?: TextFieldProps['onBlur'];
  type?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  id?: string;
  startAdornment?:ReactNode
  endAdornment?:ReactNode,
  label?: string;
  value?: unknown;
  variant?: CustomVariant;
  placeholder?: string;
  errorMessage?:string | false;
}

 const CustomTextField = ({onChange,onBlur,type,disabled,style,id,label,value,variant,placeholder, errorMessage, startAdornment, endAdornment}:CustomTextFieldProps) => {
   return (
    <Box sx={{ display:"flex", flexDirection:"column", gap:"4px"}}>
     <InputLabel sx={{ fontSize:"14px", fontWeight:"500", color:"#032541"}}>{label}</InputLabel>
     <TextField
       fullWidth
       onChange={onChange}
       onBlur={onBlur}
       type={type}
       disabled={disabled}
       style={style}
       id={id}
       placeholder={placeholder}
       error={!!errorMessage}
       value={value}
       variant={variant}
       InputProps={{
        startAdornment:startAdornment,
        endAdornment:endAdornment,
        sx: {
          "&::placeholder": {
            fontSize: "20px",
            opacity: 1,
          },
        },
      }}
        sx={{
          "& .MuiInputBase-input::placeholder": {
            fontSize: "14px",
            fontWeight: 400,
            color: "#9e9e9e",
            opacity: 1,
          },
            '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#b4bcc4', 
                borderWidth: '1px', 
                borderRadius:"8px"
            },
            '&:hover fieldset': {
                borderColor: '#b4bcc4', 
                borderRadius:"8px"
            },
            '&.Mui-focused fieldset': {
                borderColor: '#b4bcc4',
                borderRadius:"8px"
            },
            },
            }}
     />
       { errorMessage && <Typography sx={{ fontSize:"12px", color:"#dc3545"}}>{errorMessage}</Typography> } 
     </Box>
   )
 }
 
 export default CustomTextField