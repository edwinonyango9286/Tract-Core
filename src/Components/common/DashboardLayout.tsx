import { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Drawer from '../common/Drawer';
import AppBar from '../common/AppBar';


const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const drawerWidth =  232;

  return (
    <Box sx={{ display: 'flex', backgroundColor:"#F3F4F6" }}>
      <CssBaseline />
      <AppBar open={drawerOpen} toggleDrawer={toggleDrawer} />
      <Drawer open={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box component="main" sx={{ flexGrow: 1, padding:"24px",
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
           marginLeft: `-${drawerWidth}px`,
          ...(drawerOpen && {
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }), marginLeft: 0,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;