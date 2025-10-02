import { Box, Button, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"


const NotFound = () => {
    const navigate = useNavigate();
    const handleNavigateBack =()=>{
        navigate(-1)
    }
  return (
    <Box sx={{ width:"100%", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Box sx={{ width:"100%", display:"flex", alignItems:"center",flexDirection:"column"}}>
        <Box sx={{ display:"flex", flexDirection:"column"}}>
              <Typography sx={{ color:"#032541", fontSize:"60px", fontWeight:"900", textAlign:"center"}}>404</Typography>
              <Typography sx={{ color:"#032541", marginTop:"-20px", fontSize:"20px", fontWeight:"500", textAlign:"center"}}>Page not found</Typography>
        </Box>
        <Box sx={{ flexDirection:"column", display:"flex", marginTop:"10px"}}>
            <Typography sx={{ color:"#032541", fontSize:"16px", textAlign:"center" , fontWeight:"500"}}>The page you are looking for does not exist.</Typography>
            <Button onClick={handleNavigateBack} sx={{ marginTop:"10px", alignSelf:"center", width:"140px", color:"#fff", height:"44px", backgroundColor:"#032541", fontSize:"14px" , fontWeight:"400"}}>Go Back</Button>
        </Box>
        </Box>
   </Box>
  )
}

export default NotFound