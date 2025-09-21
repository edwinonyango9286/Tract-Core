import { Button, type ButtonProps } from "@mui/material";

type CustomVariant = "contained" | "outlined" | "text";

interface CustomSubmitButton extends Omit<ButtonProps, "variant"> {
  label?: string;
  variant?: CustomVariant;
  loading?: boolean;
  disabled?: boolean;
}

function CustomSubmitButton({
  loading,
  variant = "contained",
  disabled = false,
  label,
}: CustomSubmitButton) {
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={disabled}
      loading={loading}
      sx={{
        ":hover": { boxShadow: "none" },
        fontSize: "14px",
        borderRadius: "8px",
        textTransform: "none",
        height: "48px",
        boxShadow: "none",
        width: "100%",
        backgroundColor: "#032541",
      }}
    >
      {label}
    </Button>
  );
}

export default CustomSubmitButton;
