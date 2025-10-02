import React, { useState, useEffect } from 'react';
import {Drawer as MuiDrawer, List,ListItem,ListItemIcon, ListItemText,Box,Typography,Collapse, useMediaQuery, useTheme } from '@mui/material';
import {useNavigate, useLocation } from 'react-router-dom';
import { IoHomeOutline } from "react-icons/io5";
import { ExpandLess,  ExpandMore,} from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import FolderIcon from '@mui/icons-material/Folder';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CategoryIcon from '@mui/icons-material/Category';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import LayersIcon from '@mui/icons-material/Layers';
import PaletteIcon from '@mui/icons-material/Palette';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';


type DrawerItem = {
  id: string;
  text: React.ReactElement;
  icon?: React.ReactNode;
  path?: string;
  children?: DrawerItem[];
  divider?: boolean;
};

type DrawerProps = {
  open: boolean;
  toggleDrawer?: () => void;
  children?: React.ReactNode;
  navItems?: DrawerItem[];
};

const drawerWidth = 232;
const userRole = localStorage.getItem("userRole")
const Drawer = ({open, toggleDrawer, children}: DrawerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const navItems: DrawerItem[] = [
    { id: 'dashboard', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Dashboard</Typography>, icon: <IoHomeOutline fontSize={20} />, path: 'dashboard' },
    { id: 'user-setups', text: <Typography sx={{ fontSize:"16px", fontWeight:"700" ,textAlign:"start"}}>User Setups</Typography>, icon: <ManageAccountsIcon />,
     children: [
        { id: 'permissions', text: <Typography sx={{ fontSize:"16px", fontWeight:"700" ,textAlign:"start"}}>Permissions</Typography>, icon: <SecurityIcon />, path:"permissions"},
        { id: 'roles', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Roles</Typography>, icon: <AdminPanelSettingsIcon  />, path: 'roles' },
        { id: 'users', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Users</Typography>, icon: <GroupAddIcon/>, path:"users"},
      ]
    },
    { id: 'assets', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Assets</Typography>, icon: <FolderIcon/>,
      children: [
        { id: 'assets', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Assets</Typography>, icon: <BusinessCenterIcon/>, path: 'assets'},
        { id: 'category', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Category</Typography>, icon: <CategoryIcon/>, path: 'category'},
        { id: 'sub-category', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Sub-Category</Typography>, icon: <SubdirectoryArrowRightIcon />, path: 'sub-category'},
      ]
    },
    { id: 'inventory', text: <Typography sx={{ fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Inventory</Typography>, icon: <InventoryIcon/>,
      children: [
         { id: 'stack', text: <Typography sx={{ cursor:"pointer", fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Stack</Typography>,icon: <LayersIcon />, path: 'stack' },
         { id: 'pallet', text: <Typography sx={{ cursor:"pointer", fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Pallet</Typography>,icon: <PaletteIcon />, path: 'Pallet' },
      ]
    },
    { id: 'movement', text: <Typography sx={{ cursor:"pointer", fontSize:"16px", fontWeight:"700", textAlign:"start"}}>Movement</Typography>,icon: <CompareArrowsIcon/>, path: 'movement' },
  ]

  useEffect(() => {
    if (isMobile) {
      setExpandedItems({});
    }
  }, [isMobile]);

  const handleNavigation = (path?: string) => {
    if (!path) return;
    if (path === 'dashboard') {
      navigate('/dashboard'); 
    } else {
      navigate(`/dashboard/${path}`);
    }
    if (isMobile && toggleDrawer) {
      toggleDrawer();
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    const currentPath = location.pathname.replace(/\/+$/, '');
      if (path === 'dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath === `/dashboard/${path}` || 
           (path !== '' && currentPath.startsWith(`/dashboard/${path}/`));
  };
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({...prev, [id]: !prev[id]}));
  };

  const renderItem = (item: DrawerItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems[item.id] ?? false;
    const itemIsActive = isActive(item.path) || (hasChildren && item.children?.some(child => isActive(child.path)));

    return (
      <React.Fragment key={item.id}>
        <ListItem component={"div"}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
          sx={{ width: { xs: "100%", sm: "208px" }, my:"4px", height:"40px", borderRadius:"8px",cursor:"pointer", pl: depth === 0 ? 2 : depth * 3, marginLeft: { xs: "0px", sm: "10px" }, backgroundColor: itemIsActive ? 'rgba(37, 99, 235, 0.12)' : 'inherit', '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.08)'}
          }}
        >
          <ListItemIcon sx={{color:itemIsActive ? "#04f2fc":"#fff", minWidth: depth > 0 ? '24px' : { xs: '32px', sm: '36px' }}}>{item.icon}</ListItemIcon>
          <ListItemText  sx={{ color:itemIsActive ? "#04f2fc":"#fff"}}>{item.text}</ListItemText>
          {hasChildren && (isItemExpanded ? <ExpandLess  sx={{ color: itemIsActive ? "#04f2fc" : "#fff" }} /> : <ExpandMore sx={{ color: itemIsActive ? "#04f2fc" : "#fff" }} />)}
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isItemExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children?.map(child => renderItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
       </React.Fragment>
    );
  };

  return (
    <MuiDrawer  variant={isMobile ? "temporary" : "persistent"} open={open} onClose={isMobile ? toggleDrawer : undefined} sx={{width: { xs: "60%", sm: drawerWidth }, flexShrink: 0, '& .MuiDrawer-paper': { width: { xs: "60%", sm: drawerWidth }, boxSizing: 'border-box', overflowX: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor : "#032541",borderRight:"1px solid #E5E7EB"}}}>
      <Box onClick={()=>navigate("")} sx={{ gap:"20px", cursor:"pointer", position: "relative",  padding: { xs: "16px", sm: "20px" },  display: "flex",alignItems: "center",justifyContent: { xs: "space-between", sm: "center" }, width: "100%",height: { xs: "60px", sm: "68px" },flexShrink: 0}}>
        <Typography sx={{ display:"flex", textWrap:"nowrap", wordWrap:"normal", color:"#fff", alignItems:"center", textAlign:"start", fontSize: { xs: "18px", sm: "20px" }, fontWeight:"700"}}>TRACK CORE </Typography>
        <Box sx={{ display:"flex", borderRadius:"4px", alignItems:"center", justifyContent:"center", padding: { xs: "6px", sm: "8px" }, width:"auto", backgroundColor:"#fff", height: { xs: "24px", sm: "26px" }}}>
         <Typography sx={{  fontSize:"12px", fontWeight:"600", color:"#333"}}>{userRole}</Typography>
         </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <List>
          {navItems.map((item) => renderItem(item))}
        </List>
      </Box>
      {children && (
        <Box sx={{padding: { xs: "12px", sm: "16px" }, borderTop: '1px solid rgba(0, 0, 0, 0.12)',flexShrink: 0 }}>{children}</Box>
      )}
      <Box sx={{alignSelf:"center", marginBottom:"20px"}}>
        <Typography sx={{ textAlign:"center", fontSize:"14px", fontWeight:"500", color:"#f5f5f5"}}>©{new Date().getFullYear()} Track. All rights reserved.   Version 1.0.1</Typography>
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;