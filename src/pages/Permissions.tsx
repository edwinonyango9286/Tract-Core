import { useFormik } from "formik";
import * as Yup from "yup";
import type { AxiosError } from "axios";
import { Box, Breadcrumbs, IconButton, Modal, Typography } from "@mui/material";
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
import { useCreatePermission, useDeletePermission, usePermissions, useUpdatePermission } from "../hooks/usePermissions";
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
  const { data: permissionsList, isLoading, } = usePermissions({page: paginationModel.page + 1, limit: paginationModel.pageSize, search: debouncedSearchTerm});
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
    if (Array.isArray(permissionsList)) {
      return { rows: permissionsList, rowCount: permissionsList.length };
    }
    const response = permissionsList as unknown as PermissionsResponse;
    return { 
      rows: response.data || [], 
      rowCount: response.total || 0 
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

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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
    console.log(permissionId,"deletpermissionidhere..........")
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


  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: '#',  },
    { field: 'permissionName', headerName: 'Permission Name', flex: 1 },
    { field: 'permissionDescription', headerName: 'Permission Description', flex: 1 },
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
            <IconButton>
              <img src={dotsVertical} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
          </Box>
        );
      }
    },
  ], [handleEdit]);

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
      <Box sx={{ display: "flex", width: "100%", justifyContent: "flex-start", marginTop: "20px" }}>
        <CustomSearchTextField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search permissions..."
        />
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
      itemT0Delete={`${permissionName} permission`} />

      <Box sx={{ width: "100%", height: "70vh", marginTop: "20px" }}>
        <CustomDataGrid
          loading={isLoading}
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