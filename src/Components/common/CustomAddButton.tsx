import { Button } from "@mui/material"
import type { MouseEventHandler } from "react"

 interface CustomAddButtonProps{
    label:string
    onClick?:MouseEventHandler<HTMLButtonElement>
    variant: "text" | "contained" | "outlined"
 }

const CustomAddButton = ({label,onClick, variant="contained"}:CustomAddButtonProps) => {
  return (
    <Button
     type="button"
     sx={{fontSize:"14px", textWrap:"nowrap", width:"auto", minWidth:"132px", height:"48px", fontWeight:"500", color:'#fff', borderRadius:"8px", backgroundColor:"#032541", textTransform:"none"}}
     onClick={onClick}
     variant={variant}
    >{label}</Button>
  )
}

export default CustomAddButton