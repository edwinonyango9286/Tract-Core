import { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Drawer from '../common/Drawer';
import AppBar from '../common/AppBar';


const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const drawerWidth =  232;

  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', backgroundColor:"#F3F4F6" }}>
      <CssBaseline />
      <AppBar open={drawerOpen} toggleDrawer={toggleDrawer} />
      <Drawer open={drawerOpen} toggleDrawer={toggleDrawer} />
      <Box component="main" sx={{ flexGrow: 1, padding: { xs: "16px", sm: "24px" },
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
           marginLeft: { xs: 0, sm: `-${drawerWidth}px` },
          ...(drawerOpen && !isMobile && {
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }), marginLeft: 0,
          }),
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "60px", sm: "68px" }}} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;