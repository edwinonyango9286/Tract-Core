import { Box, Typography, Paper ,Avatar, Divider, IconButton, useMediaQuery, useTheme} from '@mui/material';
import dotsVerticalIcon from "../assets/icons/dotsVertical.svg";
import arrowUpIconGreen from "../assets/icons/arrowUpIconGreen.svg"
import chartIconGreen from "../assets/icons/chartIconGreen.svg"
import arrowDownRedIcon from "../assets/icons/arrowDownRedIcon.svg"
import chartRedIcon from "../assets/icons/chartRedIcon.svg"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Link, useNavigate } from "react-router-dom"
import userImage from "../assets/icons/arrowDownRedIcon.svg"
import dotVerticalIconGrey from "../assets/icons/dotVerticalGrey.svg"
import type {GridColDef, GridPaginationModel,} from "@mui/x-data-grid"
import  CircularProgress from "@mui/material/CircularProgress";
import { dateFormatter } from '../utils/dateFormatter';
import { useGetAssets } from '../hooks/useAssets';
import { useGetPallets } from '../hooks/usePallets';
import { useGetStacks } from '../hooks/useStacks';
import CustomDataGrid from '../Components/common/CustomDataGrid';
import { useState } from 'react';
import { useGetMovements } from '../hooks/useMovements';
import { useGetUsers } from '../hooks/useUsers';

const Dashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 2780 },
    { month: 'May', sales: 1890 },
    { month: 'Jun', sales: 2390 },
    { month: 'Jul', sales: 3490 },
    { month: 'Aug', sales: 4000 },
    { month: 'Sep', sales: 6000 },
    { month: 'Oct', sales: 7000 },
    { month: 'Nov', sales: 8000 },
    { month: 'Dec', sales: 9000 },
  ];

  const dailyData = [
  { day: 'Mon', sales: 1200 },
  { day: 'Tue', sales: 1900 },
  { day: 'Wed', sales: 1500 },
  { day: 'Thu', sales: 2100 },
  { day: 'Fri', sales: 1800 },
  { day: 'Sat', sales: 2500 },
  { day: 'Sun', sales: 1700 },
];


const [paginationModel,setPaginationModel] = useState({ page:0, pageSize:10})
const {data:getAssetsResponse , isLoading:loadingAssets } = useGetAssets({ page:paginationModel.page, size:paginationModel.pageSize });
const handlePaginationModelChange =(newModel:GridPaginationModel)=>{
 setPaginationModel(newModel)
}
const navigate = useNavigate();
const assetsCount = getAssetsResponse?.data.totalElements || 0 ;
const listOfAssets = getAssetsResponse?.data.content || []

const {data:getPallestResponse , isLoading:loadingPallets} = useGetPallets();
const palletsCount =getPallestResponse?.data.totalElements || 0;

const {data:getStackResponse, isLoading:loadingStacks} = useGetStacks();
const stackCount = getStackResponse?.data.length || 0;
const [selectedTimePeriod, setSelectedTimePeriod] = useState("Weekly");

const {data:movementsResponse, isLoading:loadingMovements} = useGetMovements();
const movementsList = movementsResponse?.data.content.slice(0,5) || [];
const movementsCount = movementsResponse?.data.totalElements || 0;

const {data:usersResponse} = useGetUsers();
const usersList = usersResponse?.data.content.slice(0,5) || [];


const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
    { field: 'model', headerName: 'Model', flex: 1, minWidth: 100 },
    { field: 'serialNumber', headerName: 'Serial Number', flex: 1, minWidth: 120 },
    { field: 'lastInspectionDate', headerName: 'Last Inspection', flex: 1, minWidth: 130,
      renderCell:(params)=>dateFormatter(params.value)
    },
    { field: 'nextInspectionDue', headerName: 'Next Inspection', flex: 1, minWidth: 130,
      renderCell:(params)=>dateFormatter(params.value)
     },
    { field: 'assignedTo', headerName: 'Assigned To', flex: 1, minWidth: 120 },
    {
      field: 'createdAt', headerName: 'Created At', flex: 1, minWidth: 120,
      renderCell: (params) => dateFormatter(params.value)
    },
    { field: 'status', headerName: 'Status', flex: 1, minWidth: 100 },]
  return (
    <Box sx={{width:"100%", padding: { xs: "16px", sm: "24px" }}}> 
      <Box sx={{width:"100%",display:"flex",alignItems:"start",gap:"12px", flexDirection:"column"}}>
      {/* Stats Cards Section */}
      <Box sx={{ width:"100%", display: 'grid', gridTemplateColumns: { 
        xs: "1fr", 
        sm: "repeat(2, 1fr)", 
        md: "repeat(4, 1fr)" 
      }, gap: { xs: 2, sm: 3, md: "24px" }, marginBottom:"24px" }}>
        <Paper component={"button"} onClick={()=>navigate("/dashboard/assets")} elevation={0} sx={{ display:"flex", flexDirection:"column", gap:"12px", border:"1px solid #EAECF0", borderRadius:"8px", cursor:"pointer", padding: { xs: "16px", sm: "20px 16px" }, boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)" }}>
          <Box sx={{display:"flex", justifyContent:"space-between"}}>
           <Typography sx={{textAlign:"start", color:"#032541", fontSize: { xs: "16px", sm: "20px" }, fontWeight:"700"}} variant="h6">Total Assets</Typography>
           <IconButton sx={{ padding: { xs: "4px", sm: "8px" } }}>
            <img src={dotsVerticalIcon} alt="dotsVerticalIcon"/>
           </IconButton>
          </Box>
          <Box sx={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Box sx={{display:"flex", flexDirection:"column", gap:"6px"}}>
            { loadingAssets ?  <CircularProgress thickness={5} size={20} sx={{ color:"#1F2937"}}/> : <Typography sx={{textAlign:"start",color:"#032541", fontSize: { xs: "24px", sm: "28px" }, fontWeight:"600"}} variant="h4">{assetsCount}</Typography>}
             <Box sx={{display:"flex", gap:"4px", alignItems:"center", justifyContent:"start"}}>
                <img src={arrowUpIconGreen} alt="arrowUpIcon" />
                <Typography sx={{ color:"#667085", fontSize: { xs: "12px", sm: "14px" }, fontWeight:"400"}}><span style={{color:"#027A48", fontSize: "14px" , fontWeight:"500"}}>40%</span> vs last month </Typography>
             </Box>
          </Box>
          <img src={chartIconGreen} alt="chatIcon" />
          </Box>
        </Paper>


       <Paper component={"button"} onClick={()=>navigate("/dashboard/stack")} elevation={0} sx={{ display:"flex", flexDirection:"column", gap:"12px", border:"1px solid #EAECF0", borderRadius:"8px", cursor:"pointer", padding: { xs: "16px", sm: "20px 16px" }, boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)" }}>
          <Box sx={{display:"flex", justifyContent:"space-between"}}>
           <Typography sx={{textAlign:"start", color:"#032541", fontSize: { xs: "16px", sm: "20px" }, fontWeight:"700"}} variant="h6">Total Stack</Typography>
            <IconButton sx={{ padding: { xs: "4px", sm: "8px" } }}>
             <img style={{height:  "24px" , width:"24px" }} src={dotsVerticalIcon} alt="dotsVerticalIcon"/>
           </IconButton>
          </Box>
          <Box sx={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Box sx={{display:"flex", flexDirection:"column", gap:"6px"}}>
             {loadingStacks ? <CircularProgress thickness={5} size={20} sx={{ color:"#1F2937"}}/> : <Typography sx={{ textAlign:"start", color:"#032541", fontSize: { xs: "24px", sm: "28px" }, fontWeight:"600"}} variant="h4">{stackCount}</Typography> }
             <Box sx={{display:"flex", gap:"4px", alignItems:"center", justifyContent:"start"}}>
                <img src={arrowDownRedIcon} alt="arrowUpIcon" style={{ width: "16px", height: "16px" }} />
                <Typography sx={{ color:"#667085", fontSize: { xs: "12px", sm: "14px" }, fontWeight:"400"}}><span style={{color:"#B42318", fontSize: "14px" , fontWeight:"500"}}>40%</span> vs last month </Typography>
             </Box>
          </Box>
          <img src={chartRedIcon} alt="chatIcon" style={{ width:  "40px" , height: "40px" }} />
          </Box>
        </Paper>

        <Paper component={"button"} onClick={()=>navigate("/dashboard/pallet")} elevation={0} sx={{ display:"flex", flexDirection:"column", gap:"12px", border:"1px solid #EAECF0", borderRadius:"8px", cursor:"pointer", padding: { xs: "16px", sm: "20px 16px" }, boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)" }}>
          <Box sx={{display:"flex", justifyContent:"space-between"}}>
           <Typography sx={{color:"#032541", fontSize: { xs: "16px", sm: "20px" }, fontWeight:"700"}} variant="h6">Total Pallets</Typography>
           <IconButton sx={{ padding: { xs: "4px", sm: "8px" } }}>
             <img style={{width:  "24px" , height: "24px" }} src={dotsVerticalIcon} alt="dotsVerticalIcon"/>
           </IconButton>
          </Box>
          <Box sx={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Box sx={{display:"flex", flexDirection:"column", gap:"6px"}}>
             { loadingPallets ? <CircularProgress thickness={5} size={20} sx={{ color:"#1F2937"}}  /> : <Typography sx={{textAlign:"start", color:"#032541", fontSize: { xs: "24px", sm: "28px" }, fontWeight:"600"}} variant="h4">{palletsCount}</Typography> }
             <Box sx={{display:"flex", gap:"4px", alignItems:"center", justifyContent:"start"}}>
                <img src={arrowUpIconGreen} alt="arrowUpIcon" style={{ width:  "16px" , height:  "16px"  }} />
                <Typography sx={{ color:"#667085", fontSize: { xs: "12px", sm: "14px" }, fontWeight:"400"}}><span style={{color:"#027A48", fontSize: "14px" , fontWeight:"500"}}>40%</span> vs last month </Typography>
             </Box>
          </Box>
          <img src={chartIconGreen} alt="chatIcon" style={{ width: "40px" , height: "40px" }} />
          </Box>
        </Paper>

        <Paper component={"button"} onClick={()=>navigate("/dashboard/movement")} elevation={0} sx={{ display:"flex", flexDirection:"column", gap:"12px", border:"1px solid #EAECF0", borderRadius:"8px", cursor:"pointer", padding: { xs: "16px", sm: "20px 16px" }, boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)" }}>
          <Box sx={{display:"flex", justifyContent:"space-between"}}>
           <Typography sx={{textAlign:"start", color:"#032541", fontSize: { xs: "16px", sm: "20px" }, fontWeight:"700"}} variant="h6">Total Movements</Typography>
           <IconButton sx={{ padding: { xs: "4px", sm: "8px" } }}>
             <img style={{width:"24px", height:"24px" }} src={dotsVerticalIcon} alt="dotsVerticalIcon"/>
           </IconButton>
          </Box>
          <Box sx={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Box sx={{display:"flex", flexDirection:"column", gap:"6px"}}>
            { loadingMovements ? <CircularProgress size={20} thickness={5} sx={{ color:"#1F2937"}}/> : <Typography sx={{textAlign:"start", color:"#032541", fontSize: { xs: "24px", sm: "28px" }, fontWeight:"600"}} variant="h4">{movementsCount}</Typography>}
             <Box sx={{display:"flex", gap:"4px", alignItems:"center", justifyContent:"start"}}>
                <img src={arrowUpIconGreen} alt="arrowUpIcon" style={{ width: "16px" , height:  "16px"  }} />
                <Typography sx={{ color:"#667085", fontSize: { xs: "12px", sm: "14px" }, fontWeight:"400"}}><span style={{color:"#027A48", fontSize: "14px" , fontWeight:"500"}}>40%</span> vs last month </Typography>
             </Box>
          </Box>
          <img src={chartIconGreen} alt="chatIcon" style={{ width: "40px" , height: "40px"  }} />
          </Box>
        </Paper>

      </Box>

      {/* Main Content Area */}
      <Box sx={{ width:"100%", display:"flex",flexDirection: { xs: "column", lg: "row" }, gap:"20px"}}>  
        {/* Left Content - Chart and Cards */}
        <Box sx={{ width: { xs: "100%", lg: "76%" }, display:"flex", gap:"20px", flexDirection:"column"}}>

         {/* Chart Section */}
         <Paper elevation={0} sx={{padding: { xs: "16px", sm: "24px" },width:"100%", height: { xs: "400px", sm: "500px", md: "600px" }, backgroundColor:"#fff",boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)"}}>
          <Box sx={{ width:"100%",display:"flex",flexDirection:"column", gap:"10px"}}> 
            <Box sx={{width:"100%", display:"flex", flexDirection: { xs: "column", sm: "row" }, justifyContent:"space-between", gap: { xs: 2, sm: 0 }}}>
              <Typography variant='body2'  sx={{color:"#1F2937", fontWeight:"700", fontSize: { xs: "18px", sm: "20px" }, textAlign:"start"}}>Total payment (Ksh 11,353,373.67)</Typography>
              <Box sx={{display:"flex", justifyContent: { xs: "start", sm: "end" }, gap:"8px", width: { xs: "100%", sm: "50%" }}}>
                <Box  onClick={()=>setSelectedTimePeriod("Weekly")} sx={{ cursor:"pointer", width:"72px", justifyContent:"center", display:"flex", flexDirection:"column", gap:"2px"}}>
                  <Typography sx={{ alignSelf:"center", color: selectedTimePeriod === "Weekly" ? "#2563EB" :"#4B5563",  fontSize:"14px", fontWeight:"600"}}>Weekly</Typography>
                 { selectedTimePeriod === "Weekly" && <Divider sx={{borderWidth:"2px", borderRadius:"4px",  backgroundColor:"#2563EB" }}/>}
                </Box>
                <Box onClick={()=>setSelectedTimePeriod("Monthly")} sx={{ cursor:"pointer", width:"72px", justifyContent:"center", display:"flex", flexDirection:"column", gap:"2px"}}>
                  <Typography sx={{ alignSelf:"center", color: selectedTimePeriod === "Monthly" ? "#2563EB" :"#4B5563",  fontSize:"14px", fontWeight:"600"}}>Monthly</Typography>
                  { selectedTimePeriod === "Monthly" && <Divider sx={{borderWidth:"2px", borderRadius:"4px", backgroundColor:"#2563EB" }}/>}
                </Box>
                <IconButton sx={{ padding: { xs: "4px", sm: "8px" } }}>
                  <img src={dotVerticalIconGrey} alt="dotVerticalIcon" style={{ width:"25px", height:"25px"}} />
                </IconButton>

              </Box>
            </Box>
            <Box sx={{width:"100%", marginTop:"14px"}}>
              <ResponsiveContainer width="100%" height={isMobile ? 300 : isTablet ? 400 : 500}>
                { selectedTimePeriod ==="Weekly" ? 
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="day" />
                       <YAxis />
                       <Tooltip />
                       <Legend />
                       <Bar dataKey="sales" fill="#032541" />
                  </BarChart>
                :
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#032541" />
                </BarChart>}
              </ResponsiveContainer>
            </Box>

          </Box>
         </Paper>

         {/* Users and Movements Cards */}
         <Box sx={{ display:"flex", flexDirection: { xs: "column", md: "row" }, gap:"20px", width:"100%" }}>
          <Paper elevation={0} sx={{ display:"flex" , flexDirection:"column", gap:"16px", padding: { xs: "16px", sm: "24px" }, width: { xs: "100%", md: "50%" },height: { xs: "auto", md: "400px" }, backgroundColor:"#fff", boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)" }}>
            <Box sx={{ width:"100%", display:"flex", justifyContent:"space-between"}}>
              <Typography sx={{ textAlign:"start", fontSize: { xs: "16px", sm: "18px" }, fontWeight:"600", color:"#111827"}}>Latest Users</Typography>
              <Typography component={"a"} onClick={()=>navigate("/dashboard/users")} sx={{ cursor:"pointer", fontSize:"14px", fontWeight:"500", color:"#3B82F6"}}>View all</Typography>
            </Box>
            <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
              {usersList?.map((user, index)=>( 
              <Box key={index} sx={{ gap:"10px", width:"100%", display:"flex", flexDirection:"column"}}>
               <Divider sx={{ borderWidth:"1px", color:"#E5E7EB", display: index === 0 ? "none":""}} />
              <Box sx={{ width:"100%", display:"flex", flexDirection: { xs: "column", sm: "row" }, justifyContent:"space-between", gap: { xs: 1, sm: 0 }}}>
              <Box sx={{ display:"flex", gap:"10px", width: { xs: "100%", sm: "50%" }}}>
                <Avatar src={user?.secure_url} sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }} />
                <Box sx={{ display:"flex", flexDirection:"column"}}>
                  <Typography variant='body2' sx={{fontSize: { xs: "14px", sm: "16px" }, fontWeight:"600", color:"#374151"}}>{user.firstname} {user.lastname} </Typography>
                  <Typography sx={{ fontSize: { xs: "11px", sm: "12px" }, fontWeight:"400", color:"#374151"}}>{user.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                <Typography  sx={{ textAlign: { xs: "start", sm: "end" }, fontSize:"14px", fontWeight:"400"}}>{user?.roleDescription}</Typography>
              </Box>
            </Box>
            </Box>
          ))}
          </Box>
          </Paper> 

           <Paper elevation={0} sx={{ display:"flex" , gap:"16px", flexDirection:"column", padding: { xs: "16px", sm: "24px" }, width: { xs: "100%", md: "50%" },height: { xs: "auto", md: "400px" }, backgroundColor:"#fff", boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)" }}>
            <Box sx={{ width:"100", display:"flex", justifyContent:"space-between"}}>
             <Typography sx={{ textAlign:"start", fontSize: { xs: "16px", sm: "18px" }, fontWeight:"600", color:"#111827"}}>Recent Movements</Typography>
               <Typography component={"a"} onClick={()=>navigate("/dashboard/movement")} sx={{ cursor:"pointer", textAlign:"start", fontSize:"14px", fontWeight:"500", color:"#3B82F6"}}>View all</Typography>
            </Box>
            {movementsList.map((movement)=>(
              <Box key={movement.moveId} sx={{ width:"100%", display:"flex", flexDirection: { xs: "column", sm: "row" }, justifyContent:"space-between", gap: { xs: 1, sm: 0 }}}>
              <Box sx={{ width: { xs: "100%", sm: "50%" } , display:"flex" , flexDirection:"column", gap: { xs: 1, sm: 0 }}}>
                <Box sx={{ display:"flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: "10px" }}}>
                <Box sx={{ display:"flex", gap:"4px", alignItems:"center"}}>
                  <Typography sx={{fontSize: { xs: "14px", sm: "16px" }, fontWeight:"600", color:"#111827"}}>From:</Typography>
                  <Typography sx={{fontSize: { xs: "13px", sm: "14px" }, fontWeight:"400", color:"#111827"}}>{movement.fromStackCode}</Typography>
                </Box>
                 <Box sx={{ display:"flex", gap:"4px", alignItems:"center"}}>
                  <Typography sx={{fontSize: { xs: "14px", sm: "16px" }, fontWeight:"600", color:"#111827"}}>To:</Typography>
                  <Typography sx={{fontSize: { xs: "13px", sm: "14px" }, fontWeight:"400", color:"#111827"}}>{movement.toStackCode}</Typography>
                </Box>
               </Box>
                <Box sx={{ display:"flex", gap:"4px"}}>
                  <Typography sx={{ fontWeight:"400", fontSize: { xs: "11px", sm: "12px" }, color:"#333" }}>Operator:</Typography>
                  <Typography sx={{ fontWeight:"400", fontSize: { xs: "11px", sm: "12px" }, color:"#3B82F6" }}>{movement.operatorName}</Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: "100%", sm: "50%" }}}>
                <Typography sx={{ textAlign: { xs: "start", sm: "end" },fontSize: { xs: "14px", sm: "16px" }, fontWeight:"600",color:"#111827"}}>Pallet:<span style={{marginLeft:"4px", fontSize:"16px", fontWeight:"400", color:"#4B5563"}}>{movement.palletCode}</span></Typography>
              </Box>
            </Box>
            ))}
          </Paper>

         </Box>
        </Box>

        {/* Activity Sidebar */}
        <Paper elevation={0} sx={{ padding: { xs: "16px", sm: "20px 16px" }, width: { xs: "100%", lg: "24%" }, height: { xs: "auto", lg: "1020px" }, backgroundColor:"#fff" , boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)"}}>
          <Box sx={{display:"flex", flexDirection:"column", gap:"10px"}}>
           <Box sx={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <Typography sx={{ fontSize: { xs: "18px", sm: "20px" }, fontWeight:"700", color:"#101828"}}>Activity</Typography>
              <Link to={"/"} style={{ color:"#3B82F6", fontSize:"14px", fontWeight:"500", textDecoration:"none"}} >View all</Link>
           </Box>
           <Box sx={{ display:"flex", gap:"12px"}}>
              <Avatar src={userImage} alt='userImage' sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }} />
            <Box sx={{ display:"flex", flexDirection:"column",}}>
                 <Typography variant='body2' sx={{fontSize: { xs: "14px", sm: "16px" }, fontWeight:"600", color:"#344054"}}>Demi Wikinson<span style={{ marginLeft: "40px", color:"#344054", fontWeight:"400", fontSize: "12px" }}>2 Hours ago</span></Typography>
                 <Typography variant='body2' sx={{fontSize: { xs: "13px", sm: "14px" }, fontWeight:"500", color:"#4B5563"}}>Added Property<span style={{ marginLeft:"4px", color:"#3B82F6", fontWeight:"400", fontSize: "14px" }}>:Garden City Estates</span> </Typography>
            </Box>
           </Box>
          </Box>
        </Paper> 
      </Box>

      {/* Assets Table */}
      <Paper elevation={0} sx={{padding: { xs: "16px", sm: "20px" }, width:"100%",height: { xs: "500px", sm: "600px" },backgroundColor:"#fff",marginTop:"10px", boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)"}}>
        <Box sx={{ height:"100%", display:"flex", flexDirection:"column",gap:"4px"}}>
          <Typography sx={{fontWeight:"600", fontSize: { xs: "18px", sm: "20px" }, color:"#111827", textAlign:"start"}}>Assets</Typography>
          <Box sx={{ width:"100%", display:"flex", flexDirection: { xs: "column", sm: "row" }, justifyContent:"space-between", gap: { xs: 1, sm: 0 }}}>
             <Typography sx={{fontWeight:"400", fontSize:"14px", color:"##6B7280", textAlign:"start"}}>This is a list of latest Assets.</Typography>
             <Typography onClick={()=>navigate("/dashboard/assets")} sx={{ cursor:"pointer", fontSize:"14px", marginRight:"10px", fontWeight:"500", color:"#3B82F6"}}>View all</Typography>
          </Box>
          <Box sx={{ width:"100%", marginTop:"20px"}}>
            <CustomDataGrid 
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            getRowId={(row)=>row.code}
            loading={loadingAssets} 
            rowCount={assetsCount} 
            rows={listOfAssets}
            columns={columns}
            />
          </Box>
        </Box>
      </Paper>
      

      </Box>
    </Box>
  );
};

export default Dashboard;