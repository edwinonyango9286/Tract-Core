import { Button, useMediaQuery, useTheme } from "@mui/material"
import type { CSSProperties, MouseEventHandler } from "react"

 interface CustomAddButtonProps{
    label:string
    onClick?:MouseEventHandler<HTMLButtonElement>
    variant: "text" | "contained" | "outlined"
    fullWidth?: boolean
    style?:CSSProperties
 }

const CustomAddButton = ({  style ,label,onClick, variant="contained", fullWidth}:CustomAddButtonProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Button
     type="button"
     sx={{
        fontSize: { xs: "12px", sm: "14px" }, 
        boxShadow:"none", 
        ":hover":{ boxShadow:"none" }, 
        textWrap:"nowrap", 
        height: { xs: "40px", sm: "48px" },
        fontWeight:"500", 
        color:'#fff', 
        borderRadius:"8px", 
        backgroundColor:"#032541", 
        textTransform:"none",
        padding: { xs: "8px 16px", sm: "12px 24px" }
     }}
     style={style}
     onClick={onClick}
     variant={variant}
     fullWidth={fullWidth || isMobile}
    >{label}</Button>
  )
}

export default CustomAddButton