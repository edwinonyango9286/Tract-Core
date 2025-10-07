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
import React, { useCallback, useMemo, useState } from "react";
import editIcon from "../../assets/icons/editIcon.svg";
import deleteIcon from "../../assets/icons/deleteIcon.svg"
import dotsVertical from "../../assets/icons/dotsVertical.svg"
import type { AxiosError } from "axios";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useGetCategories } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { CreateSubCategoryPayload, DeactivateSubCategoryPayload, GetSubCategoriesResponse, SubCategory } from "../../types/subCategory";
import CustomSelect from "../../Components/common/CustomSelect";
import type { Category } from "../../types/category";
import { useChangeSubCategoryStatus, useCreateSubCategory, useDeleteSubCategory, useExportSubCategories, useGetSubCategories, useGetSubCategoryKPI, useUpdateSubCategory } from "../../hooks/useSubCategories";
import { dateFormatter } from "../../utils/dateFormatter";
import menuIcon from "../../assets/icons/menuIcon.svg"
import { formatISO } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Sub-Categories
  </Typography>,
];

// Responsive modal style
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

const SubCategorySchema = Yup.object<CreateSubCategoryPayload>({
  name: Yup.string().required("Please provide sub category name."),
  description: Yup.string().required("Please provide sub category description."),
  categoryCode: Yup.string().required("Please select category."),
  status: Yup.string().oneOf(["ACTIVE", "INACTIVE"]).required("Please select sub category status.")
})

const SubCategories = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteSubCategoryMutation = useDeleteSubCategory();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteSubCategoryMutation.isPending;
  const { data: getCategoriesReponse } = useGetCategories();
  const categoriesList = getCategoriesReponse?.data.content || []
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const [status, setStatus] = useState<string>("");
  const handleChangeStatus = (e: SelectChangeEvent<string>) => {
    setStatus(e.target.value);
  }

  const { data: subCategoriesList, isLoading } = useGetSubCategories({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    search: debouncedSearchTerm,
    status,
    startDate: startDate ? formatISO(startDate) : '',
    endDate: endDate ? formatISO(endDate) : ''
  })
  const createSubCategoryMutation = useCreateSubCategory();
  const updateSubCategoryMutation = useUpdateSubCategory();
  const [subCategoryData, setSubCategoryData] = useState<SubCategory | null>(null);

  const { rows, rowCount } = useMemo(() => {
    if (!subCategoriesList) {
      return { rows: [], rowCount: 0 };
    }
    const response = subCategoriesList as unknown as GetSubCategoriesResponse;
    return {
      rows: response.data.content || [],
      rowCount: response.data.totalElements || 0
    };
  }, [subCategoriesList]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subCategoryName, setSubCategoryName] = useState<string>("");

  const handleOpenDeleteModal = (categoryId: string) => {
    setOpenDeleteModal(true);
    setSelectedCategoryId(categoryId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedCategoryId("");
    setSubCategoryName("");
  }
  const [open, setOpen] = useState(false);
  const handleDeleteCategory = useCallback(async () => {
    if (selectedCategoryId) {
      try {
        await deleteSubCategoryMutation.mutateAsync(selectedCategoryId);
        showSnackbar("Category deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedCategoryId, showSnackbar, deleteSubCategoryMutation])

  const [updatingSubCategory, setUpdatingSubCategory] = useState<boolean>(false)
  const SubCategoryFormik = useFormik<CreateSubCategoryPayload>({
    initialValues: {
      name: subCategoryData?.name || "",
      description: subCategoryData?.description || "",
      categoryCode: subCategoryData?.categoryCode || "",
      status: subCategoryData?.status || "ACTIVE"
    },
    validationSchema: SubCategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingSubCategory && subCategoryData) {
          const updatePayload = { ...values, subCategoryCode: subCategoryData.code };
          await updateSubCategoryMutation.mutateAsync(updatePayload);
          showSnackbar("Sub category updated successfully.", "success");
        } else {
          await createSubCategoryMutation.mutateAsync(values);
          showSnackbar("Sub category created successfully.", "success");
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
    setUpdatingSubCategory(false);
    setSubCategoryData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    SubCategoryFormik.resetForm();
    setUpdatingSubCategory(false);
    setSubCategoryData(null);
  }, [SubCategoryFormik]);

  const handleEdit = useCallback((subCategory: SubCategory) => {
    setSubCategoryData(subCategory);
    setUpdatingSubCategory(true);
    setOpen(true);
  }, []);

  const [anchorElelementAction, setAnchorElelementAction] = useState<null | HTMLElement>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const openActionMenu = Boolean(anchorElelementAction);

  const handleClickActionMenu = (event: React.MouseEvent<HTMLButtonElement>, subCategories: SubCategory) => {
    setAnchorElelementAction(event.currentTarget);
    setSelectedSubCategory(subCategories);
  };
  const handleCloseActionMenu = () => {
    setAnchorElelementAction(null);
    setSelectedSubCategory(null);
  };

  const updateSubCategoryStatusMutation = useChangeSubCategoryStatus();
  const isDeactivating = updateSubCategoryStatusMutation.isPending;

  const handleUpdateSubCategoryStatus = async () => {
    try {
      if (selectedSubCategory) {
        let deactivateSubCategoryPayload: DeactivateSubCategoryPayload = {}
        if (selectedSubCategory.status === "ACTIVE") {
          deactivateSubCategoryPayload = { name: selectedSubCategory.name, description: selectedSubCategory.description, categoryCode: selectedSubCategory.categoryCode, subCategoryCode: selectedSubCategory.code, status: "INACTIVE" }
        }
        else if (selectedSubCategory.status === "INACTIVE") {
          deactivateSubCategoryPayload = { name: selectedSubCategory.name, description: selectedSubCategory.description, categoryCode: selectedSubCategory.categoryCode, subCategoryCode: selectedSubCategory.code, status: "ACTIVE" }
        }
        await updateSubCategoryStatusMutation.mutateAsync(deactivateSubCategoryPayload)
      }
      handleCloseActionMenu();
      showSnackbar(`Sub category status updated successfully`, "success")
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      showSnackbar(err.response?.data.message || err.message)
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
      minWidth:  120
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth:  150,
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      flex: 1,
      minWidth: 120
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => dateFormatter(params.value)
    },
     {
      field: "status",
      headerName: "status",
      flex: 1,
      minWidth: 100,
          renderCell:(params)=>(
           <Box sx={{ marginTop:"10px",borderRadius:"16px", display:"flex", justifyContent:"center", alignItems:"center",width: params.value === "ACTIVE" ? "70px" : params.value === "INACTIVE" ? "80px" : "90px", padding:"4px", backgroundColor: params.value === "ACTIVE" ? "#ECFDF3": params.value === "INACTIVE" ? "#FEF3F2" : ""}}>
             <Typography sx={{ fontSize:"12px", fontWeight:"500", textAlign:"center", color:params.value === "ACTIVE" ? "#027A48": params.value === "INACTIVE" ? "#B42318"  :"#333"}}>{params.value}</Typography>
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
            <IconButton size={isSmallMobile ? "small" : "medium"} onClick={() => handleEdit(params.row as SubCategory)}>
              <img src={editIcon} alt="editIcon" style={{ width: isSmallMobile ? "18px" : "21px", height: isSmallMobile ? "18px" : "21px" }}/>
            </IconButton>
            <IconButton size={isSmallMobile ? "small" : "medium"} onClick={() => { handleOpenDeleteModal(params?.row?.code); setSubCategoryName(params?.row?.name)}}>
              <img src={deleteIcon} alt="deleteIconSmall"style={{ width: isSmallMobile ? "20px" : "24px", height: isSmallMobile ? "20px" : "24px" }}/>
            </IconButton>
            <IconButton  sx={{}} size={isSmallMobile ? "small" : "medium"} id="action-menu-button" aria-controls={openActionMenu ? 'action-menu' : undefined} aria-haspopup="true" aria-expanded={openActionMenu ? 'true' : undefined} onClick={(event) => handleClickActionMenu(event, params.row as SubCategory)}>
              <img src={dotsVertical} alt="deleteIconSmall" style={{ width: isSmallMobile ? "20px" : "24px", height: isSmallMobile ? "20px" : "24px"}}/>
            </IconButton>

            {/* dots vertical action menu here */}
            <Menu id="action-menu" anchorEl={anchorElelementAction} open={openActionMenu} onClose={handleCloseActionMenu} slotProps={{ list: { 'aria-labelledby': 'action-menu-button' } }}>
              <MenuItem onClick={handleCloseActionMenu}>View Details</MenuItem>
              {selectedSubCategory?.status === "ACTIVE" && (<MenuItem onClick={handleUpdateSubCategoryStatus}>{isDeactivating ? <CircularProgress thickness={5} size={20} sx={{ marginLeft: "30px", color: "#333" }} /> : "Deactivate"}</MenuItem>)}
              {selectedSubCategory?.status === "INACTIVE" && (<MenuItem onClick={handleUpdateSubCategoryStatus}> {isDeactivating ? <CircularProgress thickness={5} size={20} sx={{ marginLeft: "30px", alignSelf: "center", color: "#333" }} /> : "Activate"}</MenuItem>)}
            </Menu>
          </Box>
        );
      }
    },
  ];

  // sub catgories kpis
  const { data: subCategoriesKpiResponse, isLoading: isKpiLoading } = useGetSubCategoryKPI();
  const subCategoriesKpiData = subCategoriesKpiResponse?.data;

  // export as csv functionality here...
  const exportSubCategoriesMutation = useExportSubCategories();
  const handleExport = async () => {
    try {
      const blob = await exportSubCategoriesMutation.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subcategories_export_${new Date().toISOString().split('T')[0]}.csv`;
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
    <Box sx={{ width: "100%", minHeight: "100vh"}}>
      <Box sx={{ width: "100%", display: "flex",  justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 2, sm: 0 }}}>
        <Box sx={{ display: "flex",alignItems: "center", width: { xs: "100%", sm: "auto" }}}>
          <IconButton onClick={() => navigate(-1)} size={isSmallMobile ? "small" : "medium"}>
            <ArrowBackIosNewIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </IconButton>
          <Typography sx={{fontSize: { xs: "20px", sm: "25px" },fontWeight: "600",color: "#032541"}}>
            Sub Categories
          </Typography>
        </Box>

        <Box sx={{display: 'flex',gap: 2, width: { xs: "100%", sm: "auto" },justifyContent: { xs: "flex-start", sm: "flex-end" }}}>
          <CustomAddButton style={{ width:"140px"}}  variant="contained" label="Add Sub category" onClick={handleOpen}/>
        </Box>
      </Box>
      <Box sx={{ width: "100%", marginTop: { xs: "-10px", sm: "-10px" },marginLeft: { xs: "30px", sm: "40px" }}}>
        <Breadcrumbs style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }} aria-label="breadcrumb" separator={<FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }} />}>
          {breadcrumbs}
        </Breadcrumbs>
      </Box>

      <Box sx={{ marginTop: { xs: "20px", sm: "0px" }}}>
        <Box sx={{ width: "100%",marginTop: "10px", marginBottom: "20px"}}>
          <Box sx={{ marginTop: "10px", width: "100%", display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: { xs: 2, sm: 0 }}}>
            <Box sx={{ display: "flex",flexDirection: "column", width: { xs: "100%", sm: "auto" }}}>
              <Typography sx={{ textAlign: { xs: "center", sm: "start" },fontSize: "16px", fontWeight: "600", color: "#1F2937"}}>
                Total
              </Typography>
              <Typography sx={{ fontSize: { xs: "32px", sm: "40px" }, fontWeight: "600", color: "#1F2937", textAlign: { xs: "center", sm: "left" }}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : subCategoriesKpiData?.totalSubCategories || 0}
              </Typography>
            </Box>
            <Divider
              orientation={isMobile ? "horizontal" : "vertical"}
              sx={{
                borderWidth: "1px",
                width: { xs: "100%", sm: "auto" },
                height: { xs: "auto", sm: "80px" }
              }}
            />
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: "100%", sm: "auto" }
            }}>
              <Typography sx={{
                textAlign: { xs: "center", sm: "start" },
                fontSize: "16px",
                fontWeight: "600",
                color: "#059669"
              }}>
                Active
              </Typography>
              <Typography sx={{
                fontSize: { xs: "32px", sm: "40px" },
                fontWeight: "600",
                color: "#059669",
                textAlign: { xs: "center", sm: "left" }
              }}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : subCategoriesKpiData?.byStatus?.ACTIVE || 0}
              </Typography>
            </Box>
            <Divider
              orientation={isMobile ? "horizontal" : "vertical"}
              sx={{
                borderWidth: "1px",
                color: "#333",
                width: { xs: "100%", sm: "auto" },
                height: { xs: "auto", sm: "80px" }
              }}
            />
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: "100%", sm: "auto" }
            }}>
              <Typography sx={{
                textAlign: { xs: "center", sm: "start" },
                fontSize: "16px",
                fontWeight: "600",
                color: "#DC2626"
              }}>
                Inactive
              </Typography>
              <Typography sx={{
                fontSize: { xs: "32px", sm: "40px" },
                fontWeight: "600",
                color: "#DC2626",
                textAlign: { xs: "center", sm: "left" }
              }}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color: "#333" }} /> : subCategoriesKpiData?.byStatus?.INACTIVE || 0}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ width: "100%", borderWidth: "1px", color: "#333", marginTop: { xs: "20px", sm: "0px" } }} />
        </Box>

        <Box sx={{ display: "flex", width: "100%", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", marginTop: "10px", gap: { xs: 2, sm: 0 }}}>
          <Box sx={{ order: { xs: 2, sm: 1 },width: { xs: "100%", sm: "auto" }}}>
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={exportSubCategoriesMutation.isPending}
              endIcon={exportSubCategoriesMutation.isPending ? <CircularProgress thickness={5} size={16} sx={{ color: "#333" }} /> : <img src={menuIcon} alt="menu icon" />}
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
              {exportSubCategoriesMutation.isPending ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: "10px", sm: "20px" }, alignItems: { xs: "stretch", sm: "center" }, order: { xs: 1, sm: 2 }, width: { xs: "100%", sm: "auto" }}}>
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
                  <Button variant="outlined"size="small" onClick={handleClearDates} sx={{ borderRadius: "8px", borderColor: "#D1D5DB", textTransform: "none", color: "#333", height: '40px', width: { xs: "100%", sm: "auto" }}}>
                    Clear dates
                  </Button>
                )}
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "10px", width: { xs: "100%", sm: "auto" }}}>
              <Box sx={{ width: { xs: "100%", sm: "200px" } }}>
                <Select
                  displayEmpty
                  renderValue={value => value === '' ? 'Select Status' : value}
                  size="small"
                  sx={{
                    width: "100%",
                    '& .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' }
                  }}
                  id="status"
                  value={status}
                  onChange={handleChangeStatus}
                >
                  <MenuItem value={"ACTIVE"}>Active</MenuItem>
                  <MenuItem value={"INACTIVE"}>Inactive</MenuItem>
                </Select>
              </Box>
              <CustomSearchTextField value={searchTerm} onChange={handleSearchChange} placeholder="Search category..." sx={{ width: { xs: "100%", sm: "auto" } }}/>
            </Box>
          </Box>
        </Box>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={getModalStyle(isMobile)}>
            <form style={{ width: "100%" }} onSubmit={SubCategoryFormik.handleSubmit}>
              <Typography sx={{ fontSize: { xs: "18px", sm: "20px" }, fontWeight: "700" }}>
                {updatingSubCategory ? "Update Sub Category Details" : "Add Sub Category"}
              </Typography>
              <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <CustomTextField
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Name"
                  onChange={SubCategoryFormik.handleChange}
                  value={SubCategoryFormik.values.name}
                  onBlur={SubCategoryFormik.handleBlur}
                  errorMessage={SubCategoryFormik.touched.name && SubCategoryFormik.errors.name}
                />
                <CustomTextField
                  id="description"
                  type="text"
                  name="description"
                  label="Description"
                  placeholder="Description"
                  onChange={SubCategoryFormik.handleChange}
                  value={SubCategoryFormik.values.description}
                  onBlur={SubCategoryFormik.handleBlur}
                  errorMessage={SubCategoryFormik.touched.description && SubCategoryFormik.errors.description}
                />
                <CustomSelect
                  label="Category"
                  name="categoryCode"
                  id="categoryCode"
                  value={SubCategoryFormik.values.categoryCode}
                  onChange={SubCategoryFormik.handleChange}
                  onBlur={SubCategoryFormik.handleBlur}
                  options={categoriesList?.map((category: Category) => ({
                    value: category.code,
                    label: category.name
                  })) || []}
                  searchable
                  error={SubCategoryFormik.touched.categoryCode && Boolean(SubCategoryFormik.errors.categoryCode)}
                  helperText={SubCategoryFormik.touched.categoryCode && SubCategoryFormik.errors.categoryCode}
                />

                <Box sx={{ marginBottom: "20px", marginTop: "10px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <CustomCancelButton onClick={handleClose} label="Cancel" sx={{ width: { xs: "100%", sm: "auto" } }}/>
                  <CustomSubmitButton loading={SubCategoryFormik.isSubmitting} label={updatingSubCategory ? "Update Sub Category" : "Create Sub Category"} sx={{ width: { xs: "100%", sm: "auto" } }}/>
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
          itemT0Delete={`${subCategoryName} category`}
        />

        <Box sx={{ width: "100%", height: { xs: "400px", sm: "70vh" }, marginTop: "20px", overflow: "auto"}}>
          <CustomDataGrid
            loading={isLoading}
            rows={rows}
            rowCount={rowCount}
            getRowId={(row) => row.code}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            columns={columns}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default SubCategories