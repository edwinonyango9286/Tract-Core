import { Box, Breadcrumbs, IconButton, Menu, MenuItem, Modal, Typography } from "@mui/material"
import CustomSearchTextField from "../Components/common/CustomSearchTextField";
import { FiberManualRecord } from "@mui/icons-material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CustomAddButton from "../Components/common/CustomAddButton";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../Components/common/CustomTextField";
import CustomCancelButton from "../Components/common/CustomCancelButton";
import CustomSubmitButton from "../Components/common/CustomSubmitButton";
import CustomDeleteComponent from "../Components/common/CustomDeleteComponent";
import CustomDataGrid from "../Components/common/CustomDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useCallback, useMemo, useState } from "react";
import editIcon from "../assets/icons/editIcon.svg";
import deleteIcon from "../assets/icons/deleteIcon.svg"
import dotsVertical from "../assets/icons/dotsVertical.svg"
import type { AxiosError } from "axios";
import { useSnackbar } from "../hooks/useSnackbar";
import { useCreateUser, useDeleteUser, useGetUsers, useUpdateUser } from "../hooks/useUsers";
import { useDebounce } from "../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { User, CreateUserPayload, GetAllUsersResponse } from "../types/user";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomPhoneInput from "../Components/common/CustomPhoneInput";
import CustomSelect from "../Components/common/CustomSelect";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/roles";
import { generateUserPassword } from "../utils/generateUserPassword";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Users
  </Typography>,
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  paddingY: "10px",
  paddingX: "30px",
  borderRadius: "8px",
  maxHeight: "90vh",
  overflowY: "auto"
};

const UserSchema = Yup.object<CreateUserPayload>({
  firstName: Yup.string().required("Please provide user first name."),
  lastName:Yup.string().required("Please provide user last name."),
  idNo:Yup.number().required("Please provide  user Id number."),
  phone:Yup.string().required("Please provide  user phone number."),
  email: Yup.string().email("Please provide a valid email.").required("Please provide user email."),
  role: Yup.number().required("Please select user role."),
})

const Users = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteUserMutation = useDeleteUser();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteUserMutation.isPending;
  const { data: usersList, isLoading } = useGetUsers({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm })
  const { data:roles }= useRoles();
  const rolesList = roles?.data;
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const [userData, setUserData] = useState<User | null>(null)

  const { rows, rowCount } = useMemo(() => {
    if (!usersList) {
      return { rows: [], rowCount: 0 };
    }
    const response = usersList as unknown as GetAllUsersResponse;
    console.log(response.data,"responsedatahere...................")
    console.log(response.data.totalElements,"totalelementshereeeeeeeeeeeeeeeee")
    return {
      rows: response.data.content || [],
      rowCount: response.data.totalElements || 0
    };
  }, [usersList]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  const handleOpenDeleteModal = (userId: number) => {
    setOpenDeleteModal(true);
    setSelectedUserId(userId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedUserId(null);
    setUserName("");
  }
  const [open, setOpen] = useState(false);

  const handleDeleteUser = useCallback(async () => {
    if (selectedUserId) {
      try {
        await deleteUserMutation.mutateAsync(selectedUserId);
        showSnackbar("User deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedUserId, showSnackbar, deleteUserMutation])

  const [updatingUser, setUpdatingUser] = useState<boolean>(false)

  // Action menu state
  const [anchorElementAction, setAnchorElementAction] = useState<null | HTMLElement>(null);
  const openActionMenu = Boolean(anchorElementAction);
  const handleClickActionMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElementAction(event.currentTarget);
  };
  const handleCloseActionMenu = () => {
    setAnchorElementAction(null);
  };


  const UserFormik = useFormik<CreateUserPayload>({
    initialValues: {
      email: userData?.email || "",
      firstName: userData?.firstname || "",
      lastName:userData?.lastname || "",
      idNo:userData?.userIdNumber || "",
      phone:userData?.userPhoneNumber || "",
      role:userData?.roleDescription ||"",
    },
    validationSchema: UserSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingUser && userData) {
          const updateUserPayload ={...values, userId: userData.id}
          await updateUserMutation.mutateAsync(updateUserPayload);
          showSnackbar("User updated successfully.", "success");
        } else {
          const password =  generateUserPassword()
          const payload = {...values, password:password}
          await createUserMutation.mutateAsync(payload);
          showSnackbar("User created successfully.", "success");
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

  const handleOpen = useCallback(() => {
    setOpen(true);
    setUpdatingUser(false);
    setUserData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    UserFormik.resetForm();
    setUpdatingUser(false);
    setUserData(null);
  }, [UserFormik]);

  const handleEdit = useCallback((user: User) => {
    setUserData(user);
    setUpdatingUser(true);
    setOpen(true);
  }, []);


  const columns: GridColDef[] = useMemo(() => [
    { field: 'firstname', headerName: 'First Name', flex: 1 },
    { field: 'lastname', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'userPhoneNumber', headerName: 'Phone Number', flex: 1 },
    { field: 'userIdNumber', headerName: 'Id Number', flex: 1 },
    { field: 'phoneVerified', headerName: 'Phone Verified', flex: 1, renderCell:(params)=>  { return params.value ? <Typography>Yes</Typography>: <Typography>No</Typography> }},
    { field: "roleDescription", headerName:"Role Description", flex:1},
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as User)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={() => {handleOpenDeleteModal(params?.row?.id); setUserName(`${params.row.firstname} ${params.row.lastname}`) }}>
              <img src={deleteIcon} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
            <IconButton 
              id="basic-button"
              aria-controls={openActionMenu ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openActionMenu ? 'true' : undefined}
              onClick={handleClickActionMenu}
            >
              <img src={dotsVertical} alt="dotsVertical" style={{ width: "24px", height: "24px" }} />
            </IconButton>

            {/* Action Menu */}
            <Menu
              id="basic-menu"
              anchorEl={anchorElementAction}
              open={openActionMenu}
              onClose={handleCloseActionMenu}
              slotProps={{
                list: {
                  'aria-labelledby': 'basic-button',
                },
              }}
            >
              <MenuItem onClick={handleCloseActionMenu}>View Details</MenuItem>
              <MenuItem onClick={handleCloseActionMenu}>Reset Password</MenuItem>
              <MenuItem onClick={handleCloseActionMenu}>Send Invitation</MenuItem>
            </Menu>
          </Box>
        );
      }
    },
  ], [handleEdit]);

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ width: "100%", alignItems: "center", display: "flex" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Users</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add User" onClick={handleOpen} />
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
        <CustomSearchTextField value={searchTerm} onChange={handleSearchChange} placeholder="Search user..."/>
      </Box>

      {/* user modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={UserFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingUser ? "Update User Details" : "Add User"}
            </Typography>

             <Box sx={{ width:"100%", marginTop:"20px", display:"flex", gap:"20px"}}>
                <CustomTextField
                id="firstName"
                name="firstName"
                label="First name"
                type="text"
                placeholder="First name"
                onChange={UserFormik.handleChange}
                value={UserFormik.values.firstName}
                onBlur={UserFormik.handleBlur}
                errorMessage={UserFormik.touched.firstName && UserFormik.errors.firstName}
              />
               <CustomTextField
                id="lastName"
                name="lastName"
                label="Last name"
                type="text"
                placeholder="Last name"
                onChange={UserFormik.handleChange}
                value={UserFormik.values.lastName}
                onBlur={UserFormik.handleBlur}
                errorMessage={UserFormik.touched.lastName && UserFormik.errors.lastName}
              />
              </Box>
             <Box sx={{ width:"100%", marginTop:"20px" }}>
              <CustomTextField
                id="email"
                type="email"
                name="email"
                label="Email"
                placeholder="Email"
                onChange={UserFormik.handleChange}
                value={UserFormik.values.email}
                onBlur={UserFormik.handleBlur}
                errorMessage={UserFormik.touched.email && UserFormik.errors.email}
              />
              </Box>
              <Box sx={{ width:"100%", marginTop:"20px", display:"flex", gap:"20px"}}>
               <CustomTextField
                id="idNo"
                type="number"
                name="idNo"
                label="Id Number"
                placeholder="Id Number"
                onChange={UserFormik.handleChange}
                value={UserFormik.values.idNo}
                onBlur={UserFormik.handleBlur}
                errorMessage={UserFormik.touched.idNo && UserFormik.errors.idNo}
              />
              <Box sx={{ width:"50%"}}>
              <CustomPhoneInput 
               name="phone"
               label="Phone Number"
               id="phone"
               onBlur={UserFormik.handleBlur}
               onChange={(value)=>UserFormik.setFieldValue("phone", value)}
               value={UserFormik.values.phone}
               errorMessage={UserFormik.touched.phone && UserFormik.errors.phone}
              />
              </Box>
              </Box>
              <Box sx={{ width:"100%", marginTop:"20px", marginBottom:"20px"}}>
              <CustomSelect 
                id="role"
                label="Role"
                name="role"
                value={UserFormik.values.role}
                onChange={UserFormik.handleChange}
                onBlur={UserFormik.handleBlur}
                searchable
                options={rolesList?.map((role:Role)=>({
                  value:role.roleCode,
                  label:role.roleName
                }))}
                error={UserFormik.touched.role && Boolean(UserFormik.errors.role)}
                helperText ={UserFormik.touched.role && UserFormik.errors.role}
              />
              <Box sx={{ marginBottom: "20px",marginTop: "30px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton loading={UserFormik.isSubmitting} label={updatingUser ? "Update User" : "Create User"}/>
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
        title={"Delete User"}
        onConfirm={handleDeleteUser}
        itemT0Delete={`${userName}`}
      />

      <Box sx={{ width: "100%", height: "70vh", marginTop: "20px" }}>
        <CustomDataGrid
          loading={isLoading}
          rows={rows}
          rowCount={rowCount}
          getRowId={(row) => row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          columns={columns}
        />
      </Box>
    </Box>
  )
}

export default Users