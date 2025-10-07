import { Box, Breadcrumbs, Button, CircularProgress, Divider, IconButton, Menu, MenuItem, Modal, Select, Typography, type SelectChangeEvent, useTheme, useMediaQuery } from "@mui/material"
import CustomSearchTextField from "../../Components/common/CustomSearchTextField";
import { FiberManualRecord } from "@mui/icons-material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CustomAddButton from "../../Components/common/CustomAddButton";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../Components/common/CustomTextField";
import CustomCancelButton from "../../Components/common/CustomCancelButton";
import CustomSubmitButton from "../../Components/common/CustomSubmitButton";
import CustomDeleteComponent from "../../Components/common/CustomDeleteComponent";
import CustomDataGrid from "../../Components/common/CustomDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useCallback, useState } from "react";
import editIcon from "../../assets/icons/editIcon.svg";
import deleteIcon from "../../assets/icons/deleteIcon.svg"
import dotsVertical from "../../assets/icons/dotsVertical.svg"
import type { AxiosError } from "axios";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useCreateCategory, useDeleteCategory, useExportCategories, useGetCategories, useGetCatgoriesKPI, useUpdateCategory, useUpdateCategoryStatus } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Category, CreateCategoryPayload } from "../../types/category";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../../utils/dateFormatter";
import menuIcon from "../../assets/icons/menuIcon.svg";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { formatISO } from "date-fns";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Categories
  </Typography>,
];

const getModalStyle = (isMobile: boolean) => ({
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
  overflow: 'auto' 
});

const CategorySchema = Yup.object<CreateCategoryPayload>({
  name: Yup.string().required("Please provide category name."),
  description: Yup.string().required("Please provide category description"),
})

const Categories = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteCategoryMutation = useDeleteCategory();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteCategoryMutation.isPending;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [categoryStatus, setCategoryStatus] = useState<string>("");
  const handleCategoryStatusChange = (e: SelectChangeEvent<string>) => {
    setCategoryStatus(e.target.value)
  }

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const { data: categoriesResponse, isLoading } = useGetCategories({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    search: debouncedSearchTerm,
    categoryStatus,
    startDate: startDate ? formatISO(startDate) : '',
    endDate: endDate ? formatISO(endDate) : ''
  });
  const categoriesList = categoriesResponse?.data.content || [];
  const rowCount = categoriesResponse?.data?.totalElements || 0;
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const [categoryData, setCategoryData] = useState<Category | null>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");


  const handleOpenDeleteModal = (categoryId: string) => {
    setOpenDeleteModal(true);
    setSelectedCategoryId(categoryId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedCategoryId("");
    setCategoryName("");
  }
  const [open, setOpen] = useState(false);

  const handleDeleteCategory = useCallback(async () => {
    if (selectedCategoryId) {
      try {
        await deleteCategoryMutation.mutateAsync(selectedCategoryId);
        showSnackbar("Category deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedCategoryId, showSnackbar, deleteCategoryMutation])

  const [updatingCategory, setUpdatingCategory] = useState<boolean>(false)
  const CategoryFormik = useFormik<CreateCategoryPayload>({
    initialValues: {
      name: categoryData?.name || "",
      description: categoryData?.description || "",
    },
    validationSchema: CategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingCategory && categoryData) {
          await updateCategoryMutation.mutateAsync({ code: categoryData.code, ...values });
          showSnackbar("Category updated successfully.", "success");
        } else {
          await createCategoryMutation.mutateAsync(values);
          showSnackbar("Category created successfully.", "success");
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
    setUpdatingCategory(false);
    setCategoryData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    CategoryFormik.resetForm();
    setUpdatingCategory(false);
    setCategoryData(null);
  }, [CategoryFormik]);

  const handleEdit = useCallback((category: Category) => {
    setCategoryData(category);
    setUpdatingCategory(true);
    setOpen(true);
  }, []);

  const updateCategoryStatusMutation = useUpdateCategoryStatus();
  const isDeactivating = updateCategoryStatusMutation.isPending
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openActionMenu = Boolean(anchorEl);
  const handleClickActionMenu = (e: React.MouseEvent<HTMLButtonElement>, category: Category) => {
    setAnchorEl(e.currentTarget);
    setSelectedCategory(category)
  };
  const handleCloseActionMenu = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleUpdateCategoryStatus = async () => {
    try {
      if (selectedCategory) {
        let updateStatusPayload = {};
        if (selectedCategory.status === "ACTIVE") {
          updateStatusPayload = {
            code: selectedCategory.code,
            status: "INACTIVE"
          }
        } else if (selectedCategory.status === "INACTIVE") {
          updateStatusPayload = {
            code: selectedCategory.code,
            status: "ACTIVE"
          }
        }
        await updateCategoryStatusMutation.mutateAsync(updateStatusPayload);
        showSnackbar("Category status updated successfully", "success");
        handleCloseActionMenu();
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      showSnackbar(err.response?.data.message || err.message, "error");
    }
  }

  const columns: GridColDef[] = [
    { 
      field: 'code', 
      headerName: 'Code', 
      flex: 1,
      minWidth: 100 
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 1,
      minWidth:  150,
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => dateFormatter(params.value)
    },
    { 
      field: 'updatedAt', 
      headerName: 'Updated At', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => dateFormatter(params.value)
    },
    { 
      field: "status", 
      headerName: "Status",
      flex: 1,
      minWidth: 100,
         renderCell:(params)=>(
              <Box sx={{ marginTop:"10px",borderRadius:"16px", display:"flex", justifyContent:"center", alignItems:"center",width: params.value === "ACTIVE" ? "70px" : params.value === "INACTIVE" || params.value === "ARCHIVED" ? "80px" : "90px", padding:"4px", backgroundColor: params.value === "ACTIVE" ? "#ECFDF3": params.value === "INACTIVE" ? "#FEF3F2" : params.value === "ARCHIVED" ? "#F2F4F7" :""}}>
                 <Typography sx={{ fontSize:"12px", fontWeight:"500", textAlign:"center", color:params.value === "ACTIVE" ? "#027A48": params.value === "INACTIVE" ? "#B42318"  :  params.value === "ARCHIVED" ? "#344054" : ""}}>{params.value}</Typography>
              </Box>
    )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      minWidth: isSmallMobile ? 120 : 150,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "5px" }}>
            <IconButton size={isSmallMobile ? "small" : "medium"} onClick={() => handleEdit(params.row as Category)}>
              <img src={editIcon} alt="editIcon" style={{ width: isSmallMobile ? "18px" : "21px", height: isSmallMobile ? "18px" : "21px" }}/>
            </IconButton>
            <IconButton size={isSmallMobile ? "small" : "medium"} onClick={() => { handleOpenDeleteModal(params?.row?.code); setCategoryName(params?.row?.name) }}>
              <img src={deleteIcon}  alt="deleteIconSmall" style={{ width: isSmallMobile ? "20px" : "24px", height: isSmallMobile ? "20px" : "24px"}}/>
            </IconButton>

            <IconButton size={isSmallMobile ? "small" : "medium"} id="action-menu-button" aria-controls={openActionMenu ? 'action-menu-button' : undefined} aria-haspopup="true" aria-expanded={openActionMenu ? 'true' : undefined} onClick={(e) => handleClickActionMenu(e, params.row as Category)}>
              <img src={dotsVertical} alt="deleteIconSmall" style={{ width: isSmallMobile ? "20px" : "24px", height: isSmallMobile ? "20px" : "24px"}}/>
            </IconButton>
            <Menu id="action-menu-button" anchorEl={anchorEl} open={openActionMenu} onClose={handleCloseActionMenu} slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}>
              <MenuItem onClick={handleCloseActionMenu}>View details</MenuItem>
              <MenuItem onClick={handleUpdateCategoryStatus}>
                {selectedCategory?.status === "ACTIVE" ? "Deactivate" : selectedCategory?.status === "INACTIVE" ? "Activate" : isDeactivating ? <CircularProgress thickness={5} size={16} sx={{ color: "#333", marginLeft: "20px" }} /> : null}
              </MenuItem>
            </Menu>
          </Box>
        );
      }
    },
  ];

  const { data: categoriesKPIResponse, isLoading: isKpiLoading } = useGetCatgoriesKPI();
  const exportCategoriesMutation = useExportCategories();

  const handleExport = async () => {
    try {
      const blob = await exportCategoriesMutation.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `categories_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      showSnackbar(err.response?.data.message || err.message, "error");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", overflow:"hidden", marginTop:{ sm: "-10px"} }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 2, sm: 0 }}}>
        <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: "auto" }}}>
          <IconButton onClick={() => navigate(-1)} size={isSmallMobile ? "small" : "medium"}>
            <ArrowBackIosNewIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </IconButton>
          <Typography sx={{ fontSize: { xs: "20px", sm: "25px" }, fontWeight: "600", color: "#032541" }}>
            Categories
          </Typography>
        </Box>
        <CustomAddButton style={{ width:"140px"}} variant="contained" label="Add Category" onClick={handleOpen}/>
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ width: "100%", marginTop: { xs: "-16px", sm: "-10px" }, marginLeft: { xs: "30px", sm: "40px" }}}>
        <Breadcrumbs style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }} aria-label="breadcrumb" separator={<FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }} />}>
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
      <Box sx={{ marginTop: { xs: "20px", sm: "0px" }}}>
        <Box sx={{ width: "100%", marginTop: "10px", marginBottom: "20px"}}>
          <Box sx={{ marginTop: "10px", width: "100%", display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: { xs: 2, sm: 0 }}}>
            <Box sx={{ display: "flex", flexDirection: "column", width: { xs: "100%", sm: "auto" }}}>
              <Typography sx={{ textAlign: { xs: "center", sm: "start" }, fontSize: "16px", fontWeight: "600", color: "#1F2937"}}>
                Total
              </Typography>
              <Typography sx={{ fontSize: { xs: "32px", sm: "40px" }, fontWeight: "600", color: "#1F2937", textAlign: { xs: "center", sm: "left" }}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : categoriesKPIResponse?.data?.totalCategories || 0}
              </Typography>
            </Box>
            <Divider orientation={isMobile ? "horizontal" : "vertical"} sx={{ borderWidth: "1px", width: { xs: "100%", sm: "auto" },height: { xs: "auto", sm: "80px" }}}/>
            <Box sx={{ display: "flex", flexDirection: "column", width: { xs: "100%", sm: "auto" }}}>
              <Typography sx={{ textAlign: { xs: "center", sm: "start" }, fontSize: "16px", fontWeight: "600", color: "#059669"}}>
                Active
              </Typography>
              <Typography sx={{ fontSize: { xs: "32px", sm: "40px" }, fontWeight: "600", color: "#059669", textAlign: { xs: "center", sm: "left" }}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : categoriesKPIResponse?.data?.activeCount || 0}
              </Typography>
            </Box>
            <Divider orientation={isMobile ? "horizontal" : "vertical"} sx={{ borderWidth: "1px", color: "#333", width: { xs: "100%", sm: "auto" }, height: { xs: "auto", sm: "80px" }}}/>
            <Box sx={{ display: "flex", flexDirection: "column", width: { xs: "100%", sm: "auto" }}}>
              <Typography sx={{ textAlign: { xs: "center", sm: "start" },fontSize: "16px",fontWeight: "600",color: "#DC2626"}}>
                Inactive
              </Typography>
              <Typography sx={{ fontSize: { xs: "32px", sm: "40px" },fontWeight: "600", color: "#DC2626", textAlign: { xs: "center", sm: "left" }}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : categoriesKPIResponse?.data?.inactiveCount || 0}
              </Typography>
            </Box>

            <Divider orientation={isMobile ? "horizontal" : "vertical"} sx={{ borderWidth: "1px", color: "#333", width: { xs: "100%", sm: "auto" }, height: { xs: "auto", sm: "80px" }}}/>
            <Box sx={{ display: "flex", flexDirection: "column", width: { xs: "100%", sm: "auto" }}}>
              <Typography sx={{ textAlign: { xs: "center", sm: "start" },fontSize: "16px",fontWeight: "600",color: "#344054"}}>
                Archived
              </Typography>
              <Typography sx={{ fontSize: { xs: "32px", sm: "40px" },fontWeight: "600", color: "#344054", textAlign: { xs: "center", sm: "left" }}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : categoriesKPIResponse?.data?.archivedCount || 0}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ width: "100%", borderWidth: "1px", color: "#333", marginTop: { xs: "20px", sm: "0px" } }} />
        </Box>
        <Box sx={{ display: "flex", width: "100%", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between",  marginTop: "20px", gap: { xs: 2, sm: 0 }}}>
          <Box sx={{ order: { xs: 2, sm: 1 },width: { xs: "100%", sm: "auto" }}}>
            <Button 
              variant="contained" 
              onClick={handleExport} 
              disabled={exportCategoriesMutation.isPending} 
              endIcon={exportCategoriesMutation.isPending ? <CircularProgress thickness={5} size={16} sx={{ color: "#333" }} /> : <img src={menuIcon} alt="menu icon" />}
              sx={{ 
                backgroundColor: '#f5f6f7', 
                borderRadius: "8px", 
                ":hover": { boxShadow: "none" }, 
                height: "48px", 
                border: "1px solid #333", 
                boxShadow: "none", 
                textWrap: "nowrap", 
                color: '#032541', 
                textTransform: 'none', 
                fontSize: '14px', 
                fontWeight: "500",
                width: { xs: "100%", sm: "auto" } 
              }}
            >
              {exportCategoriesMutation.isPending ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Box>

          <Box sx={{  display: "flex", flexDirection: { xs: "column", sm: "row" },  gap: "20px", alignItems: { xs: "stretch", sm: "center" }, order: { xs: 1, sm: 2 },  width: { xs: "100%", sm: "auto" }}}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "10px", width: { xs: "100%", sm: "auto" }}}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker 
                  disableFuture 
                  label="Start Date"  
                  value={startDate} 
                  onChange={handleStartDateChange}
                  slotProps={{ 
                    textField: { 
                      size: 'small', 
                      sx: { width: { xs: "100%", sm: 150 } }
                    }
                  }}
                />
                <DatePicker 
                  disableFuture  
                  label="End Date" 
                  value={endDate} 
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      placeholder: "Select end date", 
                      size: 'small',
                      sx: { width: { xs: "100%", sm: 150 } }
                    }
                  }}
                />
                {(startDate || endDate) && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearDates}
                    sx={{ borderRadius: "8px", borderColor: "#D1D5DB", textTransform: "none", color: "#333", height: '40px', width: { xs: "100%", sm: "auto" }}}>
                    Clear dates
                  </Button>
                )}
              </LocalizationProvider>
            </Box>

            {/* Status Select and Search */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "10px", width: { xs: "100%", sm: "auto" }}}>
              <Box sx={{ width: { xs: "100%", sm: "200px" } }}>
                <Select
                  displayEmpty
                  renderValue={value => value === '' ? 'Select Status' : value}
                  size="small"
                  sx={{  width: "100%",
                    '& .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' }
                  }}
                  id="status"
                  value={categoryStatus}
                  onChange={handleCategoryStatusChange}
                >
                  <MenuItem value={"ACTIVE"}>Active</MenuItem>
                  <MenuItem value={"INACTIVE"}>Inactive</MenuItem>
                </Select>
              </Box>
              <CustomSearchTextField value={searchTerm} onChange={handleSearchChange} placeholder="Search category..." sx={{ width: { xs: "100%", sm: "auto" } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Category Modal */}
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={getModalStyle(isMobile)}>
            <form style={{ width: "100%" }} onSubmit={CategoryFormik.handleSubmit}>
              <Typography sx={{ fontSize: { xs: "18px", sm: "20px" }, fontWeight: "700" }}>
                {updatingCategory ? "Update Category Details" : "Add Category"}
              </Typography>
              <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <CustomTextField
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Name"
                  onChange={CategoryFormik.handleChange}
                  value={CategoryFormik.values.name}
                  onBlur={CategoryFormik.handleBlur}
                  errorMessage={CategoryFormik.touched.name && CategoryFormik.errors.name}
                />
                <CustomTextField
                  id="description"
                  type="text"
                  name="description"
                  label="Description"
                  placeholder="Description"
                  onChange={CategoryFormik.handleChange}
                  value={CategoryFormik.values.description}
                  onBlur={CategoryFormik.handleBlur}
                  errorMessage={CategoryFormik.touched.description && CategoryFormik.errors.description}
                />
                <Box sx={{ marginBottom: "20px", marginTop: "10px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CustomCancelButton onClick={handleClose} label="Cancel" sx={{ width: { xs: "100%", sm: "auto" } }} />
                  <CustomSubmitButton  loading={CategoryFormik.isSubmitting} label={updatingCategory ? "Update Category" : "Create Category"} sx={{ width: { xs: "100%", sm: "auto" } }}/>
                </Box>
              </Box>
            </form>
          </Box>
        </Modal>

        <CustomDeleteComponent
          loading={isDeleting}
          open={openDeleteModal}
          onClose={handleCloseDeleteModal}
          title={"Delete Category"}
          onConfirm={handleDeleteCategory}
          itemT0Delete={`${categoryName} category`}
        />

        <Box sx={{ width: "100%", height: { xs: "400px", sm: "70vh" }, marginTop: "20px",overflow: "auto" }}>
          <CustomDataGrid
            loading={isLoading}
            rows={categoriesList}
            rowCount={rowCount}
            getRowId={(row) => row.id}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            columns={columns}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Categories