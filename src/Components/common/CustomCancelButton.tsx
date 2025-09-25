
import { Button, type ButtonProps } from "@mui/material";
import type { MouseEventHandler } from "react";

type CustomVariant = "contained" | "outlined" | "text";

interface CustomCancelButton extends Omit<ButtonProps, "variant"> {
  label?: string;
  variant?: CustomVariant;
  onClick?: MouseEventHandler<HTMLButtonElement>
}

function CustomCancelButton({ style, variant = "outlined", onClick, label}: CustomCancelButton) {
  return (
    <Button
      style={style}
      type="button"
      variant={variant}
      onClick={onClick}
      sx={{
        ":hover": { boxShadow: "none" },
        fontSize: "14px",
        borderRadius: "8px",
        textTransform: "none",
        height: "48px",
        boxShadow: "none",
        color:"#dc3545",
        width: "100%",
        border:"1px solid #dc3545",
        backgroundColor: "",
      }}
    >
      {label}
    </Button>
  );
}

export default CustomCancelButton;
