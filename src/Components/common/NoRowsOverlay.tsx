import { Box, Typography} from '@mui/material'
import NoRowsOverlayIcon from "../../assets/icons/noRowsOverlay.png"

const NoRowsOverlay = () => {
  return (
    <Box sx={{ flexDirection:"column", gap:"10px", marginTop:"40px", height:"auto", width:"100%", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <img src={NoRowsOverlayIcon} alt="noRowsOverlay"/>
        <Typography sx={{fontSize:"14px", fontWeight:"500", color:"#b4bcc4", textAlign:"center"}} >No Data to Display!</Typography>
    </Box>
  )
}

export default NoRowsOverlay