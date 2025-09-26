import { useFormik } from "formik";
import * as Yup from "yup";
import type { AxiosError } from "axios";
import { Box, Breadcrumbs, Button, CircularProgress, Divider, FormControl, IconButton, InputLabel, Menu, MenuItem, Modal, Select, Typography, type SelectChangeEvent } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { type PermissionsPayload } from "../types/permissions";
import { useSnackbar } from "../hooks/useSnackbar";
import CustomAddButton from "../Components/common/CustomAddButton";
import CustomTextField from "../Components/common/CustomTextField";
import CustomCancelButton from "../Components/common/CustomCancelButton";
import CustomSubmitButton from "../Components/common/CustomSubmitButton";
import CustomDataGrid from "../Components/common/CustomDataGrid";
import { useCreatePermission, useDeactivatePermission, useDeletePermission, usePermissions, useUpdatePermission } from "../hooks/usePermissions";
import { FiberManualRecord } from "@mui/icons-material";
import editIcon from "../assets/icons/editIcon.svg";
import deleteIcon from "../assets/icons/deleteIcon.svg";
import dotsVertical from "../assets/icons/dotsVertical.svg";
import CustomSearchTextField from "../Components/common/CustomSearchTextField";
import { type Permission } from "../types/permissions";
import { type PermissionsResponse } from "../types/permissions";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useDebounce } from "../hooks/useDebounce";
import CustomDeleteComponent from "../Components/common/CustomDeleteComponent";
import { dateFormatter } from "../utils/dateFormatter";
import dropDownIcon from "../assets/icons/dropDownIcon.svg";
import refreshIcon from "../assets/icons/refreshIcon.svg"
import type { DeactivatePermissionPayload } from "../services/permissionsService";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { formatISO } from 'date-fns';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";


const PermissionsSchema = Yup.object<PermissionsPayload>({
  permissionName: Yup.string().required("Please provide permission name."),
  permissionDescription: Yup.string().required("Please provide permission description."),
});

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Permissions
  </Typography>,
];

const Permissions = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); 

  const [startDate,setStartDate] = useState<Date | null>(null);
  const [endDate,setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (date:Date)=>{
    setStartDate(date);
    setPaginationModel((prev)=>({...prev, page:0}));
  }
  const handleEndDateChange = (date:Date) =>{
    setEndDate(date);
    setPaginationModel((prev)=>({...prev, page:0}));
  }

  const handleClearDates = ()=>{
    setStartDate(null);
    setEndDate(null);
    setPaginationModel((prev)=>({...prev, page:0 }))
  }

  const [status,setStatus ] = useState<string>("");
  const handleChangeStatus = (e:SelectChangeEvent<string>)=>{
     setStatus(e.target.value);
  }

  const { data: permissionsList, isLoading, refetch } = usePermissions({ status, page: paginationModel.page , size: paginationModel.pageSize, search: debouncedSearchTerm ,startDate: startDate ? formatISO(startDate) : '',  endDate: endDate ? formatISO(endDate) : ''  });
  const createPermissionMutation = useCreatePermission();
  const deletePermissionMutation = useDeletePermission();
  const updatePermissionMutation = useUpdatePermission();
  const isDeleting = deletePermissionMutation.isPending;
  const [updatingPermission, setUpdatingPermission] = useState(false);
  const [permissionData, setPermissionData] = useState<Permission | null>(null);
  const [open, setOpen] = useState(false);

  const { rows, rowCount } = useMemo(() => {
    if (!permissionsList) {
      return { rows: [], rowCount: 0 };
    }
    const response = permissionsList as unknown as PermissionsResponse;
    return { 
      rows: response.content || [], 
      rowCount: response.totalElements || 0 
    };
  }, [permissionsList]);

  const PermissionsFormik = useFormik<PermissionsPayload>({
    initialValues: {
      permissionName: permissionData?.permissionName || "",
      permissionDescription: permissionData?.permissionDescription || "",
    },
    validationSchema: PermissionsSchema,
    enableReinitialize: true, 
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingPermission && permissionData) {
          await updatePermissionMutation.mutateAsync({ id: permissionData.id, ...values });
          showSnackbar("Permission updated successfully.", "success");
        } else {
          await createPermissionMutation.mutateAsync(values);
          showSnackbar("Permission created successfully.", "success");
        }
        resetForm();
        handleClose();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message, "error");
      } finally {
        setSubmitting(false);
      }
    }
  });

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    paddingY: "10px",
    paddingX: "30px",
    borderRadius: "8px"
  };

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUpdatingPermission(false);
    setPermissionData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    PermissionsFormik.resetForm();
    setUpdatingPermission(false);
    setPermissionData(null);
  }, [PermissionsFormik]);

  const handleEdit = useCallback((permission: Permission) => {
    setPermissionData(permission);
    setUpdatingPermission(true);
    setOpen(true);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 })); 
  }, []);

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);


  const [openDeleteModal,setOpenDeleteModal] = useState<boolean>(false);
  const [selectedPermissionId,setSelectedPermissionId] = useState<number | null>(null);
  const [permissionName,setPermissionName] = useState<string>("");

   const handleOpenDeleteModal = (permissionId:number)=>{
    setOpenDeleteModal(true);
    setSelectedPermissionId(permissionId)
  }

  const handleCloseDeleteModal = () =>{
    setOpenDeleteModal(false);
    setSelectedPermissionId(null);
    setPermissionName("");
  }

const handleDeletePermission = useCallback(async () => {
    if (selectedPermissionId) {
        try {
            await deletePermissionMutation.mutateAsync(selectedPermissionId);
            showSnackbar("Permission deleted successfully.", "success");
            handleCloseDeleteModal();
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            showSnackbar(err.response?.data.message || err.message, "error");
        }
    }
}, [selectedPermissionId,showSnackbar,deletePermissionMutation]);

  const [anchorElelementAction, setAnchorElelementAction] = useState<null | HTMLElement>(null);
  const [selectedPermission,setSelectedPermisson] = useState<Permission | null>(null);  
  const openActionMenu = Boolean(anchorElelementAction);
  const handleClickActionMenu = (event: React.MouseEvent<HTMLButtonElement>, permission :Permission) => {
    setAnchorElelementAction(event.currentTarget);
    setSelectedPermisson(permission);
  };
  const handleCloseActionMenu = () => {
    setAnchorElelementAction(null);
    setSelectedPermisson(null);
  };

  const deactivatePermissionMutation = useDeactivatePermission();
  const isDeactivating = deactivatePermissionMutation.isPending;

  const handleDeactivatePermission =  async() => {
    try {
      if(selectedPermission){
        let deactivatePermissionPayload:DeactivatePermissionPayload = { }
        if(selectedPermission.status === "ACTIVE"){
          deactivatePermissionPayload = { id:selectedPermission.id, status:"INACTIVE" }
        }
        else if (selectedPermission.status ==="INACTIVE"){
          deactivatePermissionPayload ={ id:selectedPermission.id, status:"ACTIVE"}
        }
        await deactivatePermissionMutation.mutateAsync(deactivatePermissionPayload)
      }
      handleCloseActionMenu();
      showSnackbar(`Permission status updated successfully`, "success")
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      showSnackbar(err.response?.data.message || err.message)
    }
  }



  const columns: GridColDef[] =  [
    { field: 'permissionName', headerName: 'Name', flex: 1 },
    { field: 'permissionDescription', headerName: 'Description', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1,renderCell:(params)=>dateFormatter(params.value)},
    { field: 'updatedAt', headerName: 'Updated At', flex: 1,renderCell:(params)=> dateFormatter(params.value)},
    { field: 'status', headerName:"Status", flex:1},
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as Permission)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={()=>{handleOpenDeleteModal(params?.row?.id); setPermissionName(params?.row?.permissionName)}}>
              <img src={deleteIcon} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
            <IconButton sx={{ }}  id="action-menu-button"  aria-controls={openActionMenu ? 'action-menu' : undefined} aria-haspopup="true" aria-expanded={openActionMenu ? 'true' : undefined} onClick={(event) => handleClickActionMenu(event, params.row as Permission)}>
              <img src={dotsVertical} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
      
            {/* dots vertical action menu here */}
            <Menu id="action-menu" anchorEl={anchorElelementAction}  open={openActionMenu} onClose={handleCloseActionMenu}  slotProps={{ list: { 'aria-labelledby': 'action-menu-button'}}}>
               <MenuItem onClick={handleCloseActionMenu}>View Details</MenuItem>
               {selectedPermission?.status === "ACTIVE" && (<MenuItem onClick={handleDeactivatePermission}>{isDeactivating ? <CircularProgress  thickness={5} size={20} sx={{ marginLeft:"30px", color:"#333"}} /> : "Deactivate"}</MenuItem>)} 
               {selectedPermission?.status === "INACTIVE" && (<MenuItem onClick={handleDeactivatePermission}> {isDeactivating ? <CircularProgress thickness={5} size={20} sx={{ marginLeft:"30px", alignSelf:"center", color:"#333"}} /> : "Active"}</MenuItem>)} 
            </Menu>
          </Box>
        );
      }
    },
  ];

const [isRefreshing, setIsRefreshing] = useState(false);
const handleRefreshPermissions = useCallback(async () => {
  try {
    setIsRefreshing(true);
    setSearchTerm("");
    setPaginationModel({ page: 0, pageSize: 10 });
    await refetch();
    showSnackbar("Permissions refreshed successfully", "success");
  } catch (error) {
    console.log(error);
  } finally {
    setIsRefreshing(false);
  }
}, [refetch, showSnackbar]);


  const [anchorElementPageSizeMenu, setAnchorElementPageSizeMenu] =useState<null | HTMLElement>(null);
  const openPageSizeMenu = Boolean(anchorElementPageSizeMenu);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElementPageSizeMenu(event.currentTarget);
  };
  const handleClosePageSizeMenu = () => {
    setAnchorElementPageSizeMenu(null);
  };

  const handlePageSizeSelection = (size:number)=>{
    setPaginationModel({ page:0, pageSize:size});
    handleClosePageSizeMenu()
  }


  return (
    <Box sx={{ width: "100%", height: "auto" }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ width: "100%", alignItems: "center", display: "flex" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Permissions</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Permission" onClick={handleOpen} />
      </Box>

      <Box sx={{ width: "100%", marginTop: "-10px", marginLeft: "40px" }}>
        <Breadcrumbs
          style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }}
          aria-label="breadcrumb"
          separator={<FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }} />}
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
      <Box sx={{  alignItems:"center", display: "flex", width: "100%", justifyContent: "space-between", marginTop: "20px" }}>
         <Box sx={{ display:"flex", backgroundColor:"#fff", alignItems:"center", padding:"12px", border:"1px solid #D1D5DB", borderRadius:"8px",  width:"112px", height:"44px"}}>
          <Box id="page-size-button" aria-controls={openPageSizeMenu ? 'page-size-menu' : undefined}  aria-haspopup="true" aria-expanded={openPageSizeMenu ? 'true' : undefined} onClick={handleClick} sx={{ border:"none", alignItems:"center", justifyContent:"center", cursor:"pointer", display:"flex"}}>
            <Typography   sx={{ fontSize:"14px", fontWeight:"500", textAlign:"center"}}>
              {paginationModel.pageSize}
           </Typography>
           <IconButton>
            <img src={dropDownIcon} alt={"drop down icon"} />
           </IconButton>
          </Box>
            <Divider orientation="vertical" sx={{ height:"42px", borderWidth:"1px" }}/>
          <Box sx={{ }}>
           <IconButton onClick={handleRefreshPermissions} disabled={isRefreshing} sx={{ transition: 'transform 0.3s','&:hover': { transform: 'rotate(90deg)' }, '&:disabled': {  opacity: 0.5}}}>
              <img src={refreshIcon} alt="refresh icon" style={{ marginLeft:"2px", width: "20px", height: "20px", animation: isRefreshing ? 'spin 1s linear infinite' : 'none'}}/>
          </IconButton>
          </Box>
         </Box>
        <Menu  id="page-size-menu" anchorEl={anchorElementPageSizeMenu} open={openPageSizeMenu} onClose={handleClosePageSizeMenu} slotProps={{ list: {'aria-labelledby': 'page-size-button'}}}>
          {[10,20,50,100].map((pageSize, index)=>(
           <MenuItem key={index} onClick={()=>{handlePageSizeSelection(pageSize)}}>{pageSize}</MenuItem>
          ))}
       </Menu>
       <Box sx={{ display:"flex", gap:"20px", alignItems:"center" }}>
       <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker disableFuture label="Start Date"  value={startDate} onChange={handleStartDateChange}
            slotProps={{ textField: { size: 'small', sx: { width: 150 }}}}
          />
          <DatePicker disableFuture  label="End Date" value={endDate} onChange={handleEndDateChange}
            sx={{ width:"200px"}} 
            slotProps={{   textField: {
             placeholder: "Select end date", size: 'small',
             sx: { width: 150 }
            }
          }}
          />
          {(startDate || endDate) && (
            <Button   variant="outlined" size="small" onClick={handleClearDates} sx={{ borderRadius:"8px", borderColor:"#D1D5DB", textTransform:"none", color:"#333", height: '40px' }}>Clear dates</Button>
          )}
       </LocalizationProvider>
         <Box sx={{ width:"200px" }}>
      <Select  
        displayEmpty
        renderValue={value => value === '' ? 'Select Status' : value}
        size="small"
        sx={{ width:"100%",'& .MuiOutlinedInput-notchedOutline': { borderWidth:"1px", borderColor: '#D1D5DB'}, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
             '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth:"1px", borderColor: '#D1D5DB' }}}   id="status"  value={status} onChange={handleChangeStatus}>
          <MenuItem value={"ACTIVE"}>Active</MenuItem>
          <MenuItem value={"INACTIVE"}>Inactive</MenuItem>
        </Select>
        </Box>

        <CustomSearchTextField value={searchTerm} onChange={handleSearchChange}  placeholder="Search permissions..." />
        </Box>
      </Box>

      {/* Add/Edit Permission Modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={PermissionsFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingPermission ? "Update Permission Details" : "Add Permission"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <CustomTextField
                id="permissionName"
                name="permissionName"
                label="Permission Name"
                type="text"
                placeholder="Permission Name"
                onChange={PermissionsFormik.handleChange}
                value={PermissionsFormik.values.permissionName}
                onBlur={PermissionsFormik.handleBlur}
                errorMessage={PermissionsFormik.touched.permissionName && PermissionsFormik.errors.permissionName}
              />
              <CustomTextField
                id="permissionDescription"
                type="text"
                name="permissionDescription"
                label="Permission Description"
                placeholder="Permission Description"
                onChange={PermissionsFormik.handleChange}
                value={PermissionsFormik.values.permissionDescription}
                onBlur={PermissionsFormik.handleBlur}
                errorMessage={PermissionsFormik.touched.permissionDescription && PermissionsFormik.errors.permissionDescription}
              />
              <Box sx={{
                marginBottom: "20px",
                marginTop:"10px",
                gap: "20px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton
                  loading={PermissionsFormik.isSubmitting}
                  label={updatingPermission ? "Update Permission" : "Create Permission"}
                />
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* delete modal here */}
    <CustomDeleteComponent 
      loading={isDeleting}
      open={openDeleteModal}  
      onClose={handleCloseDeleteModal} 
      title={"Delete Permission"} 
      onConfirm={handleDeletePermission} 
      itemT0Delete={`${permissionName} permission`}
      />

      <Box sx={{ width: "100%", height: "70vh", marginTop: "20px" }}>
        <CustomDataGrid
          loading={isLoading || isRefreshing}
          rows={rows}
          rowCount={rowCount}
          getRowId={(row)=>row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          columns={columns}
        />
      </Box>

    </Box>
  );
};

export default Permissions;