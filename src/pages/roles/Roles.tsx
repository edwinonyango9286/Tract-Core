import { useFormik } from "formik"
import * as Yup from "yup"
import type { Role, RolesApiResponse, RolesPayload } from "../../types/roles"
import type { AxiosError } from "axios"
import { useSnackbar } from "../../hooks/useSnackbar"
import { Box, Breadcrumbs, IconButton, Modal, Typography, type SelectChangeEvent, useTheme, useMediaQuery } from "@mui/material"
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from "react-router-dom"
import CustomAddButton from "../../Components/common/CustomAddButton"
import React, { useCallback, useMemo, useState } from "react"
import CustomTextField from "../../Components/common/CustomTextField"
import CustomMultiSelect from "../../Components/common/CustomMultiSelect"
import CustomSubmitButton from "../../Components/common/CustomSubmitButton"
import CustomCancelButton from "../../Components/common/CustomCancelButton"
import CustomDataGrid from "../../Components/common/CustomDataGrid"
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "../../hooks/useRoles"
import { FiberManualRecord } from "@mui/icons-material"
import { useDebounce } from "../../hooks/useDebounce"
import CustomSearchTextField from "../../Components/common/CustomSearchTextField"
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid"
import editIcon from "../../assets/icons/editIcon.svg";
import deleteIcon from "../../assets/icons/deleteIcon.svg";
import dotsVertical from "../../assets/icons/dotsVertical.svg";
import { usePermissions } from "../../hooks/usePermissions"
import type { Permission } from "../../types/permissions"
import { dateFormatter } from "../../utils/dateFormatter"
import CustomDeleteComponent from "../../Components/common/CustomDeleteComponent"

const RolesSchema = Yup.object<RolesPayload>({
  name:Yup.string().required("Please provide role name."),
  shortDesc:Yup.string().required("Please provide role short description."),
  description:Yup.string().required("Please provide role description."),
  status:Yup.string().oneOf(["ACTIVE","INACTIVE"]).required("Please select role status."),
  permissions: Yup.array().of(Yup.number().required("Permission ID is required")).min(1, 'At least one permission is required').required("Please select at least one permission")
})

const breadcrumbs = [
  <Typography key={1} style={{ cursor:"pointer", color: "#707070", fontSize: "14px"}}>
    Dashboard
  </Typography>,
  <Typography  key={2} style={{ cursor:"pointer", color: "#dc3545", fontSize: "14px"}}>
    Roles
  </Typography>,
];

// Responsive modal style
const getModalStyle = (isMobile: boolean) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isMobile ? '90%' : 400,
  maxWidth: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  paddingY: "10px",
  paddingX: isMobile ? "15px" : "30px",
  borderRadius:"8px",
  maxHeight: "90vh",
  overflowY: "auto"
});

const Roles = () => {
  const {showSnackbar} = useSnackbar();
  const navigate= useNavigate();
  const createRoleMutation = useCreateRole();
  const [updatingRole,setUpadatingRole] = useState(false);
  const [roleData,setRoleData] = useState<Role | null>(null);
  const [searchTerm,setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm,500);
  const [paginationModel,setPaginationModel] = useState({ page:0, pageSize:10 });
  const { data: rolesList, isLoading } = useRoles({ page:paginationModel.page + 1, limit:paginationModel.pageSize, search:debouncedSearchTerm });
  const {data:permissionResponse } = usePermissions()
  const permissionsList =permissionResponse?.content || [];
  const updateRoleMutation =useUpdateRole();
  const deleteRoleMutation =useDeleteRole();
  const isDeletingRole = deleteRoleMutation.isPending 

  // Responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

   const { rows, rowCount } = useMemo(() => {
      if (!rolesList) {
        return { rows: [], rowCount: 0 };
      }
      if (Array.isArray(rolesList)) {
        return { rows: rolesList, rowCount: rolesList.length };
      }
      const response = rolesList as unknown as RolesApiResponse;
      return { 
        rows: response.data || [], 
        rowCount: response?.data.length || 0 
      };
    }, [rolesList]);

  const roleFormik = useFormik<RolesPayload>({
    initialValues:{
      name: roleData?.roleName || "",
      shortDesc: roleData?.roleShortDesc ||  "",
      description: roleData?.roleDescription || "",
      status: roleData?.roleStatus || "ACTIVE",
      permissions: roleData?.permissions?.map(permission => Number(permission.id)) || []
    },
     validationSchema: RolesSchema,
     enableReinitialize:true,
     onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if(updatingRole && roleData){
          const updatePayload = {...values, roleCode:roleData.roleCode}
        await updateRoleMutation.mutateAsync(updatePayload);
        showSnackbar("Role updated successfully.", "success");
        }else{
        await createRoleMutation.mutateAsync(values);
        showSnackbar("Role created successfully.", "success");
        }
        resetForm();
        handleClose();
      } catch (error) {
        const err = error as AxiosError<{message?: string}>;
        showSnackbar(err.response?.data.message || err.message, "error");
      } finally {
        setSubmitting(false);
      }
    }
  });

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() =>{
     setOpen(true);
     setUpadatingRole(false);
     setRoleData(null);
  },[]);

  const handleClose =  useCallback(() => {
    setOpen(false);
    roleFormik.resetForm();
    setUpadatingRole(false);
    setRoleData(null)
  },[roleFormik]);

const handleSearchChange = useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
  setSearchTerm(e.target.value);
  setPaginationModel((prev)=>({...prev,page:0}));
},[])


 const handleEdit = useCallback((role: Role) => {
    setRoleData(role);
    setUpadatingRole(true);
    setOpen(true);
  }, []);



const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
const [selectedRoleCode,setSelectedRoleCode] = useState<number | null>(null);
const [selectedRoleName,setSelectedRoleName] = useState<string>("");

const handleOpenDeleteModal = (roleCode:number)=>{
  setOpenDeleteModal(true);
  setSelectedRoleCode(roleCode);
}

const handleCloseDeleteModal = ()=>{
  setOpenDeleteModal(false);
  setSelectedRoleCode(null);
  setSelectedRoleName("");
}

const handleDeleteRole =  useCallback(async()=>{
  if(selectedRoleCode){
    try {
      await deleteRoleMutation.mutateAsync(selectedRoleCode);
      showSnackbar("Role deleted successfully","success");
      handleCloseDeleteModal();
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      showSnackbar(err.response?.data.message || err.message,"error")
    }
  }
},[selectedRoleCode, showSnackbar, deleteRoleMutation])

  const columns: GridColDef[] = useMemo(() => [
      { 
        field: 'roleName', 
        headerName: 'Name', 
        flex:1,
        minWidth: isSmallMobile ? 100 : 120
      },
      { 
        field: 'roleShortDesc', 
        headerName: 'Short Description', 
        flex:1,
        minWidth: isSmallMobile ? 120 : 150,
        display: isSmallMobile ? 'none' : 'flex'
      },
      { 
        field: 'roleDescription', 
        headerName: 'Description', 
        flex:1,
        minWidth: isSmallMobile ? 120 : 150,
        display: isMobile ? 'none' : 'flex'
      },
      { 
        field: 'roleStatus', 
        headerName: 'Status', 
        flex:1,
        minWidth: isSmallMobile ? 80 : 100
      },
      { 
        field: 'createDate', 
        headerName: 'Created At', 
        flex:1,
        minWidth: isSmallMobile ? 100 : 120,
        display: isSmallMobile ? 'none' : 'flex',
        renderCell:(params)=>(dateFormatter(params.row.createDate))
      },
      { 
        field: 'lastModified', 
        headerName: 'Updated At', 
        flex:1,
        minWidth: isSmallMobile ? 100 : 120,
        display: isMobile ? 'none' : 'flex',
        renderCell:(params)=>(dateFormatter(params.row.lastModified))
      },
      {
        field: 'action', 
        headerName: 'Action', 
        flex: 1,
        minWidth: isSmallMobile ? 120 : 150,
        renderCell: (params) => {
          return (
            <Box sx={{ display: "flex", gap: "5px" }}>
              <IconButton 
                size={isSmallMobile ? "small" : "medium"}
                onClick={() => handleEdit(params.row as Role)}
              >
                <img 
                  src={editIcon} 
                  alt="editIcon" 
                  style={{ 
                    width: isSmallMobile ? "18px" : "21px", 
                    height: isSmallMobile ? "18px" : "21px" 
                  }} 
                />
              </IconButton>
              <IconButton 
                size={isSmallMobile ? "small" : "medium"}
                onClick={()=>{handleOpenDeleteModal(params.row.roleCode); setSelectedRoleName(params.row.roleName)}}
              >
                <img 
                  src={deleteIcon}  
                  alt="deleteIconSmall" 
                  style={{ 
                    width: isSmallMobile ? "20px" : "24px", 
                    height: isSmallMobile ? "20px" : "24px" 
                  }} 
                />
              </IconButton>
              <IconButton size={isSmallMobile ? "small" : "medium"}>
                <img 
                  src={dotsVertical} 
                  alt="deleteIconSmall" 
                  style={{ 
                    width: isSmallMobile ? "20px" : "24px", 
                    height: isSmallMobile ? "20px" : "24px" 
                  }} 
                />
              </IconButton>
            </Box>
          );
        }
      },
  ], [handleEdit, isMobile, isSmallMobile]);

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
    }, []);

  const handlePermissionsChange = (event: SelectChangeEvent<(string | number)[]>) => {
    roleFormik.setFieldValue('permissions', event.target.value);
  };

  return (
    <Box sx={{ 
      width:"100%", 
      minHeight:"100vh",
      padding: { xs: "10px", sm: "20px" }
    }}>
      {/* Header Section */}
      <Box sx={{ 
        width:"100%", 
        display:"flex", 
        flexDirection: { xs: "column", sm: "row" },
        justifyContent:"space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ 
          display:"flex", 
          alignItems:"center",
          width: { xs: "100%", sm: "auto" }
        }}>
          <IconButton 
            onClick={()=>navigate(-1)} 
            size={isSmallMobile ? "small" : "medium"}
          >
            <ArrowBackIosNewIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </IconButton>
          <Typography sx={{ 
            fontSize: { xs: "20px", sm: "25px" }, 
            fontWeight:"600", 
            color:"#032541"
          }}>
            Roles
          </Typography>
        </Box>
        <CustomAddButton 
          variant="contained" 
          label="Add role" 
          onClick={handleOpen}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        />
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ 
        width:"100%", 
        marginTop: { xs: "10px", sm: "-10px" },
        marginLeft: { xs: "0px", sm: "40px" }
      }}>
        <Breadcrumbs 
          style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }} 
          aria-label="breadcrumb"
          separator={ <FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }}/>} 
        > 
          {breadcrumbs}
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        marginLeft: { xs: "0px", sm: "40px" },
        marginTop: { xs: "20px", sm: "0px" }
      }}>
        {/* Search Field */}
        <Box sx={{ 
          display: "flex", 
          width: "100%", 
          justifyContent: "flex-start", 
          marginTop: "20px" 
        }}>
          <CustomSearchTextField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search roles..."
            sx={{ width: { xs: "100%", sm: "auto" } }}
          />
        </Box>

        {/* Add Role Modal */}
        <Modal 
          open={open} 
          onClose={handleClose} 
          aria-labelledby="modal-modal-title" 
          aria-describedby="modal-modal-description"
        >
          <Box sx={getModalStyle(isMobile)}>
            <form style={{ width:"100%"}} onSubmit={roleFormik.handleSubmit}>
              <Typography sx={{ 
                fontSize: { xs: "18px", sm: "20px" }, 
                fontWeight:"700"
              }}>
                {updatingRole ? "Update Role Details" :"Add Role"}
              </Typography>
              <Box sx={{ marginTop:"10px", display:"flex", flexDirection:"column", gap:"20px"}}>
                <CustomTextField  
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Name"
                  onChange={roleFormik.handleChange}
                  value={roleFormik.values.name}
                  onBlur={roleFormik.handleBlur}
                  errorMessage={roleFormik.touched.name && roleFormik.errors.name}
                />
                <CustomTextField  
                  id="shortDesc"
                  type="text"
                  name="shortDesc"
                  label="Short Description"
                  placeholder="Short Description"
                  onChange={roleFormik.handleChange}
                  value={roleFormik.values.shortDesc}
                  onBlur={roleFormik.handleBlur}
                  errorMessage={roleFormik.touched.shortDesc && roleFormik.errors.shortDesc}
                />
                <CustomTextField  
                  id="description"
                  name="description"
                  type="text"
                  label="Description"
                  placeholder="Description"
                  onChange={roleFormik.handleChange}
                  value={roleFormik.values.description}
                  onBlur={roleFormik.handleBlur}
                  errorMessage={roleFormik.touched.description && roleFormik.errors.description}
                />
                <CustomMultiSelect
                  label="Select Permissions"
                  name="permissions"
                  id="permissions"
                  value={roleFormik.values.permissions} 
                  onChange={handlePermissionsChange} 
                  onBlur={roleFormik.handleBlur} 
                  options={permissionsList?.map((permission: Permission) => ({
                    value: permission.id,
                    label: permission.permissionName
                  })) || []}
                  searchable={true}
                  maxChips={2}
                />
                {roleFormik.touched.permissions && roleFormik.errors.permissions && (
                  <Typography sx={{ fontSize:"12px", marginTop:"-15px", color:"#dc3545" }}>{roleFormik.errors.permissions}</Typography>
                )}
                <Box sx={{ 
                  marginTop:"10px", 
                  marginBottom:"20px", 
                  gap:"20px", 
                  width:"100%", 
                  display:"flex", 
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent:"space-between", 
                  alignItems:"center"
                }}>
                  <CustomCancelButton  
                    onClick={()=>{handleClose()}} 
                    label="Cancel"
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  />
                  <CustomSubmitButton 
                    loading={roleFormik.isSubmitting}  
                    label={ updatingRole ? "Update Role" :"Create Role" }
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  />
                </Box>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Delete Modal */}
        <CustomDeleteComponent
          loading={isDeletingRole}
          open={openDeleteModal}  
          onClose={handleCloseDeleteModal} 
          title={"Delete Permission"} 
          onConfirm={handleDeleteRole} 
          itemT0Delete={`${selectedRoleName} permission`}
        />

        {/* Data Grid */}
        <Box sx={{ 
          width:"100%" , 
          height: { xs: "400px", sm: "70vh" }, 
          marginTop:"20px"
        }}>
          <CustomDataGrid
            loading={isLoading}
            rowCount={rowCount}
            rows={rows}
            getRowId={(row)=>row.roleCode}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            columns={columns}
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              },
              '& .MuiDataGrid-columnHeader': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Roles