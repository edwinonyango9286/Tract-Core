import { Box, Button, Modal, Typography, useMediaQuery, useTheme } from '@mui/material'
import warningRemoveIcon from "../../assets/icons/warningRemoveIcon.svg";

interface CustomDeleteComponentProps {
    title?:string;
    open:boolean;
    onClose:()=>void;
    onConfirm:()=>void;
    itemT0Delete:string;
    loading?: boolean;
}

const CustomDeleteComponent = ({ title, onClose, loading, onConfirm, open, itemT0Delete }:CustomDeleteComponentProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isMobile ? '90%' : 400, 
  maxWidth: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  paddingY: "10px",
  paddingX: isMobile ? "15px" : "30px", 
  borderRadius: "8px",
  maxHeight: '90vh', 
};
  
  return (
    <Box sx={{}}>
      <Modal open={open} onClose={onClose} aria-labelledby="custom-delete-modal" aria-describedby="custom-delete-modal">
        <Box sx={style}>
            <Box sx={{ width:"100%", display:"flex", flexWrap:"nowrap", gap:"20px"}}>
                <Box sx={{}}>                
                    <img src={warningRemoveIcon}  style={{ width:"56px", height:"56px" }} alt='warning remove icon'/>
                </Box>
                <Box sx={{ display:"flex", flexDirection:"column", gap:"20px" }}>
                <Box sx={{ display: "flex", flexWrap:"nowrap", flexDirection: "column", gap: "4px" }}>
                <Typography sx={{ fontSize: "18px", fontWeight: "700", color: "#032541" }}>
                {title}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <Typography sx={{ fontSize: "14px", fontWeight: "700", color: "#032541" }}>
                    {itemT0Delete} <span style={{fontSize: "14px", fontWeight: "400", color: "#707070" }}>will be deleted. This action cannot be undone.</span>
                </Typography>
                </Box>
                </Box>
                <Box sx={{ width:"100%", display:"flex", marginTop:"10px", marginBottom:"10px", gap:"20px"}}>
                <Button onClick={onClose} variant='outlined' sx={{ height:"46px", width:{xs:"110px", md:"130px"}, borderRadius:"8px", fontSize:"14px", fontWeight:"600", color:"#032541", border:"1px solid #032541" }}>Cancel</Button>
                <Button onClick={onConfirm} loading={loading} disabled={loading} variant='contained' sx={{ height:'46px', width:{xs:"110px", md:"130px"}, backgroundColor:"#dc3545", borderRadius:"8px", fontSize:"14px", fontWeight:"600", color:"#fff",textTransform:"none" }}>Delete</Button>
              </Box>
                </Box>
            </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default CustomDeleteComponent