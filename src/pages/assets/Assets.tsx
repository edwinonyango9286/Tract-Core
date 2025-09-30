import { Box, Breadcrumbs, Button, CircularProgress, Divider, IconButton, InputLabel, Menu, MenuItem, Modal, Select, TextField, Typography, type SelectChangeEvent, useMediaQuery, useTheme } from "@mui/material"
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
import { useAssignAssetToUser, useCreateAsset, useDeleteAsset, useExportAssets, useGetAssetKPI, useGetAssets, useUpdateAsset, useUpdateAssetStatus } from "../../hooks/useAssets";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Asset, CreateAssetPayload } from "../../types/asset";
import { useFormik} from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../../utils/dateFormatter";
import CustomSelect from "../../Components/common/CustomSelect";
import { useGetCategories } from "../../hooks/useCategories";
import { useGetSubCategories } from "../../hooks/useSubCategories";
import type { SubCategory } from "../../types/subCategory";
import CustomDatePicker from "../../Components/common/CustomDatePicker";
import type { User } from "../../types/user";
import { useGetUsers } from "../../hooks/useUsers";
import menuIcon from "../../assets/icons/menuIcon.svg"
import { formatISO } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Assets
  </Typography>,
];

// Responsive modal styles
const getModalStyle = (isMobile: boolean, isTablet: boolean) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isMobile ? '95%' : isTablet ? '90%' : 600,
  maxWidth: '95vw',
  bgcolor: 'background.paper',
  boxShadow: 24,
  paddingY: "10px",
  paddingX: isMobile ? "15px" : "30px",
  borderRadius: "8px",
  maxHeight: "90vh",
  overflowY: "auto"
});

const getAssignModalStyle = (isMobile: boolean) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isMobile ? '95%' : 400,
  maxWidth: '95vw',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: "8px",
  paddingY: 2,
  paddingX: isMobile ? 2 : 4,
  overflowY: "auto"
});

const AssetSchema = Yup.object<CreateAssetPayload>({
  name: Yup.string().required("Please provide asset name."),
  categoryCode: Yup.string().required("Please provide asset category."),
  subCategory: Yup.string().optional(),
  model:Yup.string().required("Please provide asset model."),
  serialNumber: Yup.string().required("Please provide serial number."),
  manufacturer:Yup.string().optional(),
  supplier:Yup.string().optional(),
  purchaseDate: Yup.string().required("Please provide purchase date."),
  purchaseCost: Yup.number().required("Please provide purchase cost.").min(0, "Price must be positive"),
  warrantyExpiry:Yup.string().optional(),
  assignedTo:Yup.string().optional(),
  location:Yup.string().optional(),
  status:Yup.string().oneOf(["IN_USE","IN_REPAIR","IN_STORAGE","DISPOSED"]).required("Please select asset status"),
  conditionNote: Yup.string().required("Please provide asset condition notes."),
  complianceExpiry:Yup.string().optional(),
  lastInspectionDate:Yup.string().optional(),
  nextInspectionDue:Yup.string().optional(),
  supportingDocs: Yup.string().optional(),
})

const Assets = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const deleteAssetMutation = useDeleteAsset();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteAssetMutation.isPending;

  const [startDate,setStartDate] = useState<Date | null>(null);
  const [endDate,setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (date:Date | null)=>{
    setStartDate(date);
    setPaginationModel((prev)=>({...prev, page:0}));
  }
  
  const handleEndDateChange = (date:Date | null) =>{
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

  const { data: assetsResponse, isLoading } = useGetAssets({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm , status, startDate: startDate ? formatISO(startDate) : '',  endDate: endDate ? formatISO(endDate) : '' });
  const assetsList = assetsResponse?.data?.content || [];
  const rowCount = assetsResponse?.data?.totalElements || 0;
  const { data:getCategoriesResponse} = useGetCategories();
  const categoriesList = getCategoriesResponse?.data.content || []
  const { data:subCategoriesResponse} = useGetSubCategories();
  const subCategoriesList = subCategoriesResponse?.data.content || [];
  
  const { data:usersList } = useGetUsers();
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const [assetData, setAssetData] = useState<Asset | null>(null)

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [assetName, setAssetName] = useState<string>("");

  const handleOpenDeleteModal = (assetId: string) => {
    setOpenDeleteModal(true);
    setSelectedAssetId(assetId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAssetId("");
    setAssetName("");
  }
  
  const [open, setOpen] = useState(false);

  const handleDeleteAsset = useCallback(async () => {
    if (selectedAssetId) {
      try {
        await deleteAssetMutation.mutateAsync(selectedAssetId);
        showSnackbar("Asset deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedAssetId, showSnackbar, deleteAssetMutation])

  const [updatingAsset, setUpdatingAsset] = useState<boolean>(false)
  const AssetFormik = useFormik<CreateAssetPayload>({
    initialValues: {
      name: assetData?.name || "",
      categoryCode: assetData?.categoryCode || "",
      subCategory: assetData?.subCategory || "",
      model: assetData?.model || "",
      serialNumber: assetData?.serialNumber || "",
      manufacturer:assetData?.manufacturer || "",
      supplier:assetData?.supplier || "",
      purchaseDate: assetData?.purchaseDate || "",
      purchaseCost: assetData?.purchaseCost || 0,
      warrantyExpiry:assetData?.warrantyExpiry || "",
      assignedTo:assetData?.assignedTo || "",
      location:assetData?.location || "",
      conditionNote: assetData?.conditionNote || "",
      status: assetData?.status || "",
      complianceExpiry: assetData?.complianceExpiry || "",
      lastInspectionDate :assetData?.lastInspectionDate || "",
      nextInspectionDue:assetData?.nextInspectionDue || "",
      supportingDocs:assetData?.supportingDocs || "",
    },
    validationSchema: AssetSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingAsset && assetData) {
          await updateAssetMutation.mutateAsync({ code: assetData.code, ...values });
          showSnackbar("Asset updated successfully.", "success");
        } else {
          await createAssetMutation.mutateAsync(values);
          showSnackbar("Asset created successfully.", "success");
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
    setUpdatingAsset(false);
    setAssetData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    AssetFormik.resetForm();
    setUpdatingAsset(false);
    setAssetData(null);
  }, [AssetFormik]);

  const handleEdit = useCallback((asset: Asset) => {
    setAssetData(asset);
    setUpdatingAsset(true);
    setOpen(true);
  }, []);

  const [anchorElMap, setAnchorElMap] = useState<Record<string, HTMLElement | null>>({});
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, assetCode: string) => {
    setAnchorElMap(prev => ({ ...prev, [assetCode]: event.currentTarget }));
  };
  
  const handleCloseActionMenu = (assetCode: string) => {
    setAnchorElMap(prev => ({ ...prev, [assetCode]: null }));
  };

  const [assetToAssignData,setAssetToAssignData] = useState<Asset | null>();

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const handleOpenAssignUserModal = () => setOpenAssignModal(true);
  const handleCloseAssignUserModal = () => {
    setOpenAssignModal(false);
    setAssetToAssignData(null);
    AssignFormik.resetForm();
  }

  const handleOpenAssignModal = (selectedAssetData:Asset)=> {
    setAssetToAssignData(selectedAssetData);
    handleOpenAssignUserModal();
    handleCloseActionMenu(selectedAssetData.code as string);
  }

  const AssignSchema = Yup.object({
    assignedTo:Yup.string().required(`Please provide user name`),
    location:Yup.string().required("Please provide location.")
  })

  const assignMutation = useAssignAssetToUser();
  const AssignFormik = useFormik({
    initialValues:{
      assignedTo:"",
      location:"",
    },
    validationSchema:AssignSchema,
    onSubmit:  async ( values, { setSubmitting })=>{
      try {
        if(assetToAssignData){
        const assignPayload = {...values, code:assetToAssignData.code , }
        await assignMutation.mutateAsync(assignPayload);
        showSnackbar("Asset assigned to user successfully.", "success");
        handleCloseAssignUserModal();
      }
      } catch (error) {
        const err = error as AxiosError<{message?:string}>
        showSnackbar(err.response?.data.message || err.message ,"error")
      }finally{
        setSubmitting(false)
      }
    }
  })

  const [selectedAssetToView,setSelectedAssetToView] = useState<Asset | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const handleOpenViewModal = () => setOpenViewModal(true);
  const handleCloseViewModal = () =>  {
    setOpenViewModal(false);
    setSelectedAssetToView(null);
  };

  const handleOpenAssetViewModal = (assetToView:Asset)=>{
    setSelectedAssetToView(assetToView);
    handleOpenViewModal();
    handleCloseActionMenu(assetToView.code as string);
  }

  const updateStatusModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '95%' : 400,
    maxWidth: '95vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: isMobile ? 2 : 4,
    borderRadius:"8px"
  };

  const [selectedAssetToUpdateStatus,setSelectedAssetToUpdateStatus] = useState<Asset | null>(null)
  const [openUpdateStatusModal, setOpenUpdateStatusModal] = useState(false);
  const handleOpenUpdateStatusModal = (asset:Asset) => { 
    setOpenUpdateStatusModal(true);
    handleCloseActionMenu(asset.code as string);
    setSelectedAssetToUpdateStatus(asset);
  }
  const handleCloseUpdateStatusModal = () => {
    setOpenUpdateStatusModal(false);
    setSelectedAssetToUpdateStatus(null);
    UpdateAssetStatusFormik.resetForm();
  }

  const UpdateAssetStatusSchema = Yup.object({
    status:Yup.string().oneOf(["IN_USE", "IN_REPAIR", "IN_STORAGE", "DISPOSED"]).required("Please select asset status.")
  })

  const updateAssetStatusMutation = useUpdateAssetStatus();

  const UpdateAssetStatusFormik = useFormik({
    initialValues:{
      status: selectedAssetToUpdateStatus?.status || ""
    },
    validationSchema:UpdateAssetStatusSchema,
    onSubmit: async(values, { setSubmitting })=>{
      try {
        const updateAssetStatusPayload = {
          status:values.status,
          code:selectedAssetToUpdateStatus?.code
        }
        await updateAssetStatusMutation.mutateAsync(updateAssetStatusPayload);
        showSnackbar("Asset status updated successfully.","success");
        handleCloseUpdateStatusModal();
      } catch (error) {
        const err = error as AxiosError<{message?:string}>
        showSnackbar(err.response?.data.message || err.message)
      }finally{
        setSubmitting(false);
      }
    }
  })

  // Responsive columns for DataGrid
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
    { 
      field: 'model', 
      headerName: 'Model', 
      flex: 1, 
      minWidth: 100,
      hide: isMobile 
    },
    { 
      field: 'serialNumber', 
      headerName: 'Serial Number', 
      flex: 1, 
      minWidth: 120,
      hide: isMobile 
    },
    { 
      field: 'lastInspectionDate', 
      headerName: 'Last Inspection', 
      flex: 1,
      minWidth: 120,
      hide: isMobile,
      renderCell:(params)=>dateFormatter(params.value)
    },
    { 
      field: 'nextInspectionDue', 
      headerName: 'Next Inspection', 
      flex: 1,
      minWidth: 120,
      hide: isMobile || isTablet,
      renderCell:(params)=>dateFormatter(params.value)
    },
    { 
      field: 'assignedTo', 
      headerName: 'Assigned To', 
      flex: 1,
      minWidth: 120,
      hide: isMobile
    },
    {
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 1,
      minWidth: 120,
      hide: isMobile || isTablet,
      renderCell: (params) => dateFormatter(params.value)
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      minWidth: 100
    },
    {
      field: 'action', 
      headerName: 'Action', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const assetCode = params.row.code;
        const openActionMenu = Boolean(anchorElMap[assetCode]);
        return (
          <Box sx={{ display: "flex", gap: "10px", flexWrap: "nowrap" }}>
            <IconButton onClick={() => handleEdit(params.row as Asset)} size="small">
              <img src={editIcon} alt="editIcon" style={{ width: "18px", height: "18px" }} />
            </IconButton>
            <IconButton onClick={() => {handleOpenDeleteModal(params?.row?.code); setAssetName(params?.row?.name) }} size="small">
              <img src={deleteIcon} alt="deleteIconSmall" style={{ width: "20px", height: "20px" }} />
            </IconButton>
            
            <IconButton  
              id={`action-menu-button-${assetCode}`}
              aria-controls={openActionMenu ? `action-menu-${assetCode}` : undefined}
              aria-haspopup="true"  
              aria-expanded={openActionMenu ? 'true' : undefined}
              onClick={(e) => handleClick(e, assetCode)}
              size="small"
            >
              <img src={dotsVertical} alt="dotsvertical" style={{ width: "20px", height: "20px" }} />
            </IconButton>

            <Menu 
              id={`action-menu-${assetCode}`}
              anchorEl={anchorElMap[assetCode]}
              open={openActionMenu}
              onClose={() => handleCloseActionMenu(assetCode)}
              slotProps={{ 
                list: { 
                  'aria-labelledby': `action-menu-button-${assetCode}`, 
                }, 
              }}
            >
              <MenuItem onClick={() => handleOpenAssetViewModal(params.row as Asset)}>View details</MenuItem>
              <MenuItem onClick={() => handleOpenAssignModal(params.row as Asset)}>Assign to user</MenuItem>
              <MenuItem onClick={() => handleOpenUpdateStatusModal(params.row as Asset)}>Update status</MenuItem>
            </Menu>
          </Box>
        );
      }
    },
  ]

  const {data:assetKPIResponse, isLoading:isKpiLoading} = useGetAssetKPI();

  // export as csv functionality here...
  const exportAssetsMutation = useExportAssets(); 
  const handleExport = async () => {
      try {
          const blob = await exportAssetsMutation.mutateAsync();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `assets_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          const err = error as AxiosError<{message?: string}>;
          showSnackbar(err.response?.data.message || err.message, "error");
      }
  };

  // Responsive KPI layout
  const kpiBoxStyle = {
    display: "flex", 
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "10px",
    minWidth: "120px"
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: isMobile ? 1 : 2 }}>
      <Box sx={{ width: "100%", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: isMobile ? 2 : 0 }}>
        <Box sx={{ width: "100%", alignItems: "center", display: "flex" }}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIosNewIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <Typography sx={{ fontSize: isMobile ? "20px" : "25px", fontWeight: "600", color: "#032541" }}>Assets</Typography>
        </Box>
        <Box sx={{ alignSelf: isMobile ? "flex-start" : "center", mt: isMobile ? 1 : 0 }}>
          <CustomAddButton variant="contained" label="Add Asset" onClick={handleOpen} />
        </Box>
      </Box>

      <Box sx={{ width: "100%", mt: isMobile ? 1 : 0, ml: isMobile ? 0 : "40px" }}>
        <Breadcrumbs style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }} aria-label="breadcrumb" separator={<FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }} />}>
          {breadcrumbs}
        </Breadcrumbs>
      </Box>

      <Box sx={{ ml: isMobile ? 0 : "40px", mt: 2 }}>
        <Box sx={{ width: "100%", mb: 3 }}>
          <Box sx={{ width: "100%" }}>
            <Typography sx={{ fontSize: "18px", fontWeight: "600", color: "#032541" }}>Assets Overview</Typography>
          </Box>
          
          {/* Responsive KPI Section */}
          <Box sx={{ 
            mt: 2, 
            width: "100%", 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center", 
            justifyContent: "space-between",
            gap: isMobile ? 2 : 1
          }}>
            <Box sx={kpiBoxStyle}>
              <Typography sx={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#1F2937" }}>Total</Typography>
              <Typography sx={{ fontSize: isMobile ? "30px" : "40px", fontWeight: "600", color: "#1F2937"}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color:"#333"}}/> : assetKPIResponse?.data.totalAssets || 0}
              </Typography>
            </Box>
            
            {!isMobile && <Divider orientation="vertical" sx={{ borderWidth: "1px", height: "60px" }} />}
            
            <Box sx={kpiBoxStyle}>
              <Typography sx={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#059669" }}>In Use</Typography>
              <Typography sx={{ fontSize: isMobile ? "30px" : "40px", fontWeight: "600", color: "#059669"}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color:"#333"}}/> : assetKPIResponse?.data.inUseCount || 0}
              </Typography>
            </Box>
            
            {!isMobile && <Divider orientation="vertical" sx={{ borderWidth: "1px", height: "60px" }} />}
            
            <Box sx={kpiBoxStyle}>
              <Typography sx={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#D97706" }}>In Storage</Typography>
              <Typography sx={{ fontSize: isMobile ? "30px" : "40px", fontWeight: "600", color: "#D97706"}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color:"#333"}}/> : assetKPIResponse?.data.inStorageCount || 0}
              </Typography>
            </Box>
            
            {!isMobile && <Divider orientation="vertical" sx={{ borderWidth: "1px", color: "#333", height: "60px" }} />}
            
            <Box sx={kpiBoxStyle}>
              <Typography sx={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#4B5563" }}>In Repair</Typography>
              <Typography sx={{ fontSize: isMobile ? "30px" : "40px", fontWeight: "600", color: "#4B5563"}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color:"#333"}}/> : assetKPIResponse?.data?.inRepairCount || 0}
              </Typography>
            </Box>

            {!isMobile && <Divider orientation="vertical" sx={{ borderWidth: "1px", color: "#333", height: "60px" }} />}
            
            <Box sx={kpiBoxStyle}>
              <Typography sx={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#DC2626" }}>Disposed</Typography>
              <Typography sx={{ fontSize: isMobile ? "30px" : "40px", fontWeight: "600", color: "#DC2626"}}>
                {isKpiLoading ? <CircularProgress thickness={5} size={20} sx={{ color:"#333"}}/> : assetKPIResponse?.data?.disposedCount || 0}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ width: "100%", borderWidth: "1px", color: "#333", mt: 2 }} />
        </Box>

        {/* Responsive Filter Section */}
        <Box sx={{ 
          display: "flex", 
          width: "100%", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          gap: 2,
          mt: 3 
        }}>
          <Button 
            variant="contained" 
            onClick={handleExport} 
            disabled={exportAssetsMutation.isPending} 
            endIcon={exportAssetsMutation.isPending ? <CircularProgress thickness={5} size={16} sx={{ color:"#333" }} /> : <img src={menuIcon} alt="menu icon"/>}
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
              width: isMobile ? "100%" : "auto",
              alignSelf: isMobile ? "center" : "flex-start"
            }}
          >
            {exportAssetsMutation.isPending ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto"
          }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: "flex", gap: 2, width: isMobile ? "100%" : "auto" }}>
                <DatePicker 
                  disableFuture 
                  label="Start Date"  
                  value={startDate} 
                  onChange={handleStartDateChange}
                  slotProps={{ 
                    textField: { 
                      size: 'small', 
                      sx: { width: isMobile ? "100%" : 150 } 
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
                      sx: { width: isMobile ? "100%" : 150 }
                    }
                  }}
                />
              </Box>
              {(startDate || endDate) && (
                <Button   
                  variant="outlined" 
                  size="small" 
                  onClick={handleClearDates} 
                  sx={{ 
                    borderRadius: "8px", 
                    borderColor: "#D1D5DB", 
                    textTransform: "none", 
                    color: "#333", 
                    height: '40px',
                    width: isMobile ? "100%" : "auto"
                  }}
                >
                  Clear dates
                </Button>
              )}
            </LocalizationProvider>
            
            <Box sx={{ width: isMobile ? "100%" : "200px" }}>
              <Select  
                displayEmpty
                renderValue={value => value === '' ? 'Select Status' : value}
                size="small"
                sx={{ 
                  width: "100%",
                  '& .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB'}, 
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' }
                }}   
                id="status"  
                value={status} 
                onChange={handleChangeStatus}
              >
                <MenuItem value={"IN_USE"}>In Use</MenuItem>
                <MenuItem value={"IN_REPAIR"}>In Repair</MenuItem>
                <MenuItem value={"IN_STORAGE"}>In Storage</MenuItem>
                <MenuItem value={"DISPOSED"}>Disposed</MenuItem>
              </Select>
            </Box>
            
            <CustomSearchTextField 
              value={searchTerm} 
              onChange={handleSearchChange} 
              placeholder="Search asset..."
              sx={{ width: isMobile ? "100%" : "auto" }}
            />
          </Box>
        </Box>

        {/* Asset Modal */}
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={getModalStyle(isMobile, isTablet)}>
            <form style={{ width: "100%" }} onSubmit={AssetFormik.handleSubmit}>
              <Typography sx={{ color: "#032541", fontSize: isMobile ? "18px" : "20px", fontWeight: "700" }}>
                {updatingAsset ? "Update asset details" : "Add asset"}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Form fields with responsive layout */}
                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                  <Box sx={{ width: isMobile ? "100%" : "50%" }}>
                    <CustomTextField
                      id="name"
                      name="name"
                      label="Name"
                      type="text"
                      placeholder="Asset Name"
                      onChange={AssetFormik.handleChange}
                      value={AssetFormik.values.name}
                      onBlur={AssetFormik.handleBlur}
                      errorMessage={AssetFormik.touched.name && AssetFormik.errors.name}
                    />
                  </Box>
                  <Box sx={{ width: isMobile ? "100%" : "50%" }}>
                    <CustomTextField
                      id="serialNumber"
                      name="serialNumber"
                      label="Serial Number"
                      type="text"
                      placeholder="Serial Number"
                      onChange={AssetFormik.handleChange}
                      value={AssetFormik.values.serialNumber}
                      onBlur={AssetFormik.handleBlur}
                      errorMessage={AssetFormik.touched.serialNumber && AssetFormik.errors.serialNumber}
                    />
                  </Box>
                </Box>

                {/* Continue with similar responsive patterns for other form fields... */}
                <CustomTextField
                  id="model"
                  type="text"
                  name="model"
                  label="Model"
                  placeholder="Model"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.model}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.model && AssetFormik.errors.model}
                />

                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                  <Box sx={{ width: isMobile ? "100%" : "50%" }}>
                    <CustomTextField
                      id="manufacturer"
                      type="text"
                      name="manufacturer"
                      label="Manufacturer"
                      placeholder="Manufacturer"
                      onChange={AssetFormik.handleChange}
                      value={AssetFormik.values.manufacturer}
                      onBlur={AssetFormik.handleBlur}
                      errorMessage={AssetFormik.touched.manufacturer && AssetFormik.errors.manufacturer}
                    />
                  </Box>
                  <Box sx={{ width: isMobile ? "100%" : "50%" }}>
                    <CustomTextField
                      id="supplier"
                      type="text"
                      name="supplier"
                      label="Supplier"
                      placeholder="Supplier"
                      onChange={AssetFormik.handleChange}
                      value={AssetFormik.values.supplier}
                      onBlur={AssetFormik.handleBlur}
                      errorMessage={AssetFormik.touched.supplier && AssetFormik.errors.supplier}
                    />
                  </Box>
                </Box>

                {/* Similar responsive patterns for all other form fields */}
                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                  <Box sx={{ width: isMobile ? "100%" : "50%" }}>
                    <CustomSelect 
                      label="Category"
                      name="categoryCode"
                      id="categoryCode"
                      value={AssetFormik.values.categoryCode}
                      onChange={AssetFormik.handleChange}
                      onBlur={AssetFormik.handleBlur}
                      searchable
                      options={categoriesList?.map((category)=>({
                        value:category.code,
                        label:category.name
                      }))}
                      error={AssetFormik.touched.categoryCode && Boolean(AssetFormik.errors.categoryCode)}
                      helperText={AssetFormik.touched.categoryCode && AssetFormik.errors.categoryCode}
                    />
                  </Box>
                 
                 <Box sx={{ width: isMobile ? "100%" : "50%" }}>
                    <CustomSelect
                      id="subCategory"
                      name="subCategory"
                      label="Sub Category"
                      searchable
                      options={subCategoriesList?.map((subCategory:SubCategory)=>({
                        value:subCategory.name,
                        label:subCategory.name
                      }))}
                      onChange={AssetFormik.handleChange}
                      value={AssetFormik.values.subCategory}
                      onBlur={AssetFormik.handleBlur}
                      error={AssetFormik.touched.subCategory && Boolean(AssetFormik.errors.subCategory)}
                      helperText={AssetFormik.touched.subCategory && AssetFormik.errors.subCategory}
                    />
                  </Box>
                </Box>

                {/* Continue adapting all form fields with responsive layout... */}

                <Box sx={{ mb: 2, mt: 1, gap: 2, width: "100%", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center" }}>
                  <CustomCancelButton onClick={handleClose} label="Cancel" fullWidth={isMobile} />
                  <CustomSubmitButton loading={AssetFormik.isSubmitting} label={updatingAsset ? "Update Asset" : "Create Asset"} fullWidth={isMobile} />
                </Box>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Update Status Modal */}
        <Modal open={openUpdateStatusModal} onClose={handleCloseUpdateStatusModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={updateStatusModalStyle}>
            <form style={{ width: "100%" }} onSubmit={UpdateAssetStatusFormik.handleSubmit}>
              <Typography sx={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", color: "#032541" }} >
                Update asset status
              </Typography>
              <Box sx={{ width: "100%", mt: 2 }}>
                <CustomSelect 
                  label="Status"
                  name="status"
                  id="status"
                  value={UpdateAssetStatusFormik.values.status}
                  onChange={UpdateAssetStatusFormik.handleChange}
                  onBlur={UpdateAssetStatusFormik.handleBlur}
                  searchable
                  options={[
                    {value: "IN_USE", label: "IN USE"},
                    {value: "IN_REPAIR", label: "IN REPAIR"},
                    {value: "IN_STORAGE", label: "IN STORAGE"},
                    {value: "DISPOSED", label: "DISPOSED"}
                  ]}
                  error={UpdateAssetStatusFormik.touched.status && Boolean(UpdateAssetStatusFormik.errors.status)}
                  helperText={UpdateAssetStatusFormik.touched.status && UpdateAssetStatusFormik.errors.status}
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: 2, mt: 3 }}>
                <CustomCancelButton onClick={handleCloseUpdateStatusModal} label={"Cancel"} fullWidth={isMobile} />
                <CustomSubmitButton loading={UpdateAssetStatusFormik.isSubmitting} label="Update" fullWidth={isMobile} />
              </Box>
            </form>
          </Box>
        </Modal>

        {/* View Modal */}
        <Modal open={openViewModal} onClose={handleCloseViewModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={getModalStyle(isMobile, isTablet)}>
            <Typography sx={{ color: "#032541", fontSize: isMobile ? "18px" : "20px", fontWeight: "700" }}>
              Asset details
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>

              {/* Responsive view modal content */}
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2, justifyContent: "space-between" }}>
                <Box sx={{ width: isMobile ? "100%" : "50%", display: "flex", flexDirection: "column", gap: 1 }}>
                  <InputLabel sx={{ fontWeight: "500", fontSize: "14px", color: "#032541" }}>Asset Name</InputLabel>
                  <TextField disabled sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, '& .Mui-disabled': { color: '#032541', WebkitTextFillColor: '#032541' } }} value={selectedAssetToView?.name} variant="outlined" />  
                </Box>

                <Box sx={{ width: isMobile ? "100%" : "50%", display: "flex", flexDirection: "column", gap: 1 }}>
                  <InputLabel sx={{ fontWeight: "500", fontSize: "14px", color: "#032541" }}>Category</InputLabel>
                  <TextField disabled sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, '& .Mui-disabled': { color: '#032541', WebkitTextFillColor: '#032541' } }} value={selectedAssetToView?.categoryName} variant="outlined" />  
                </Box>
              </Box>

              {/* Continue with similar responsive patterns for all view modal fields... */}

              <Box sx={{ mb: 2, mt: 2, width: "100%", alignSelf: "flex-end", display: "flex", justifyContent: "flex-end" }}>
                <CustomCancelButton style={{ width: isMobile ? "100%" : "200px" }} onClick={handleCloseViewModal} label="Close" />
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Assign Modal */}
        <Modal open={openAssignModal} onClose={handleCloseAssignUserModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={getAssignModalStyle(isMobile)}>
            <form style={{ width: "100%" }} onSubmit={AssignFormik.handleSubmit}>
              <Typography sx={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", color: "#032541" }}>
                Assign asset to user?
              </Typography>
              <Box sx={{ mt: 2, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                <CustomTextField
                  id="assignedTo"
                  type="text"
                  name="assignedTo"
                  label="User Name"
                  placeholder="User Name"
                  onChange={AssignFormik.handleChange}
                  value={AssignFormik.values.assignedTo}
                  onBlur={AssignFormik.handleBlur}
                  errorMessage={AssignFormik.touched.assignedTo && AssignFormik.errors.assignedTo}
                />
                <CustomTextField
                  id="location"
                  type="text"
                  name="location"
                  label="Location"
                  placeholder="Location"
                  onChange={AssignFormik.handleChange}
                  value={AssignFormik.values.location}
                  onBlur={AssignFormik.handleBlur}
                  errorMessage={AssignFormik.touched.location && AssignFormik.errors.location}
                />
                <Box sx={{ width: "100%", gap: 2, mt: 2, mb: 1, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-around" }}>
                  <CustomCancelButton onClick={handleCloseAssignUserModal} label={"Cancel"} fullWidth={isMobile} />
                  <CustomSubmitButton loading={AssignFormik.isSubmitting} label="Assign" fullWidth={isMobile} />
                </Box>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Delete Modal */}
        <CustomDeleteComponent
          loading={isDeleting}
          open={openDeleteModal}
          onClose={handleCloseDeleteModal}
          title={"Delete Asset"}
          onConfirm={handleDeleteAsset}
          itemT0Delete={`${assetName} asset`}
        />

        {/* Data Grid */}
        <Box sx={{ width: "100%", height: isMobile ? "60vh" : "70vh", mt: 3 }}>
          <CustomDataGrid
            loading={isLoading}
            rows={assetsList}
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

export default Assets