import { AppBar as MuiAppBar, IconButton, Toolbar,Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Cookies from "js-cookie"
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useSnackbar } from '../../hooks/useSnackbar';
import { logout } from '../../services/authService';
import logoutIcon from "../../assets/icons/logoutIcon.svg"
import notificationIcon from "../../assets/icons/notificationIcon.svg"
import profileIcon from "../../assets/icons/profileIcon.svg"

 
const drawerWidth = 232;
const AppBar = ({ open, toggleDrawer }) => {
const {showSnackbar} = useSnackbar()
const navigate = useNavigate()
 
    const handleLogout = async () => {
      try {
        const response = await logout();
        if(response.status === 200){
         localStorage.clear();
         const allCookies = Cookies.get();
         for( const cookieName in allCookies){
            Cookies.remove(cookieName)
          }
        showSnackbar(response.data.message,"success")
        navigate("/")
        }
      } catch (err) {
        const error = err as AxiosError<{ message:string}>
        showSnackbar(error.response?.data.message || error.message,"error")
      }
    }

  return (
    <MuiAppBar  position="fixed"  
      sx={{ height:"68px", boxShadow:"none", backgroundColor:"#fff", borderBottom:"1px solid #E5E7EB",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(open && {
          marginLeft: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }),
      }}
    >
      <Toolbar sx={{width:"100%"}}>
        <Box sx={{width:"100%",display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Box sx={{width:"50%", display:"flex", gap:"68px"}}>
              <IconButton aria-label="open drawer" onClick={toggleDrawer}>
                <MenuIcon sx={{color:"#242E3A"}} />
              </IconButton>
        </Box>
         <Box sx={{width:"50%" , display:"flex", gap:'10px', justifyContent:"end", alignItems:"center"}}>
          <IconButton sx={{}}>
            <img src={profileIcon} alt="mailIcon" style={{ width:"34px", height:"34px", color:"#111827"}} />
          </IconButton>
           <IconButton sx={{}}>
            <img src={notificationIcon} alt="mailIcon" style={{ width:"34px", height:"34px", color:"#111827"}}  />
          </IconButton>
          <IconButton onClick={handleLogout} sx={{}}>
            <img src={logoutIcon} alt="mailIcon" style={{ width:"34px", height:"34px", color:"#111827"}} />
          </IconButton>
        </Box>
      </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;