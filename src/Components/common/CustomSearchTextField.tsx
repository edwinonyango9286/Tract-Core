import { InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { type ChangeEventHandler } from "react";

interface CustomSearchTextFieldProps {
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  value: string;
  sx?: TextFieldProps["sx"];
  variant?: TextFieldProps["variant"];
  size?: TextFieldProps["size"];
}

const CustomSearchTextField = ({ onChange, placeholder = "Search...", value, sx, variant = "outlined", size = "medium"}: CustomSearchTextFieldProps) => {
  return (
    <TextField
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      variant={variant}
      size={size}
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderWidth: "1px",
            borderColor: "#333",
          },
        },
        ...sx,
      }}
      InputProps={{
        sx: {
          borderRadius: "8px",
          height: "44px",
        },
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default CustomSearchTextField;
