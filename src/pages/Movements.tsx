import { Box, Breadcrumbs, Button, CircularProgress, IconButton, MenuItem, Modal, Select, Typography, type SelectChangeEvent, useTheme, useMediaQuery } from "@mui/material"
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
import React, { useCallback, useState } from "react";
import editIcon from "../assets/icons/editIcon.svg";
import deleteIcon from "../assets/icons/deleteIcon.svg"
import dotsVertical from "../assets/icons/dotsVertical.svg"
import type { AxiosError } from "axios";
import { useSnackbar } from "../hooks/useSnackbar";
import { useCreateMovement, useDeleteMovement, useExportMovements, useGetMovements, useUpdateMovement } from "../hooks/useMovements";
import { useDebounce } from "../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Movement, CreateMovementPayload } from "../types/movement";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../utils/dateFormatter";
import CustomSelect from "../Components/common/CustomSelect";
import { useGetPallets } from "../hooks/usePallets";
import { useGetStacks } from "../hooks/useStacks";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import menuIcon from "../assets/icons/menuIcon.svg"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { formatISO } from "date-fns";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Movements
  </Typography>,
];

// Responsive modal style
const getModalStyle = (isMobile: boolean) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isMobile ? '95%' : 500,
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  paddingY: "10px",
  paddingX: isMobile ? "15px" : "30px",
  borderRadius: "8px",
  maxHeight: "90vh",
  overflowY: "auto"
});

const MovementSchema = Yup.object<CreateMovementPayload>({
  palletCode: Yup.string().required("Please select pallet."),
  movementType: Yup.string().required("Please select movement type."),
  fromStackCode: Yup.string().required("Please Select from stack."),
  fromLocation: Yup.string().required("Please provide from location."),
  toLocation: Yup.string().required("Please provide to location."),
  toStackCode: Yup.string().required("Please select to stack."),
  reference: Yup.string().optional(),
  notes: Yup.string().optional(),
  operatorName: Yup.string().required("Please provide name for who performed the movement."),
  returnCondition: Yup.string().required("Please select return condition."),
})

const Movements = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteMovementMutation = useDeleteMovement();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteMovementMutation.isPending;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const [type,setType ] = useState<string>("");
  const handleChangeType = (e:SelectChangeEvent<string>)=>{
     setType(e.target.value);
  }
  const { data: response, isLoading } = useGetMovements({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm, start:  startDate ? formatISO(startDate) : '' , end:endDate ? formatISO(endDate) : '',  type })
  const createMovementMutation = useCreateMovement();
  const updateMovementMutation = useUpdateMovement();
  const [movementData, setMovementData] = useState<Movement | null>(null);
  
  const {data:getPallestResponse} = useGetPallets();
  const pallets = getPallestResponse?.data.content;

  const movementsList = response?.data?.content || [];
  const rowCount = response?.data.totalElements || 0
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedMovementId, setSelectedMovementId] = useState<string>("");
  const [movementCode, setMovementCode] = useState<string>("");

  const handleOpenDeleteModal = (movementId: string) => {
    setOpenDeleteModal(true);
    setSelectedMovementId(movementId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedMovementId("");
    setMovementCode("");
  }
  const [open, setOpen] = useState(false);

  const handleDeleteMovement = useCallback(async () => {
    if (selectedMovementId) {
      try {
        await deleteMovementMutation.mutateAsync(selectedMovementId);
        showSnackbar("Movement deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedMovementId, showSnackbar, deleteMovementMutation])

  const [updatingMovement, setUpdatingMovement] = useState<boolean>(false)
  const MovementFormik = useFormik<CreateMovementPayload>({
    initialValues: {
      palletCode: movementData?.palletCode || "",
      movementType: movementData?.movementType || "",
      fromLocation: movementData?.fromLocation || "",
      toLocation: movementData?.toLocation || "",
      fromStackCode: movementData?.fromStackCode || "",
      toStackCode: movementData?.toStackCode || "",
      reference: movementData?.reference || "",
      operatorName: movementData?.operatorName || "",
      notes: movementData?.notes || "",
      returnCondition: movementData?.returnCondition || "",
    },
    validationSchema: MovementSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingMovement && movementData) {
          await updateMovementMutation.mutateAsync({ moveId: movementData.moveId, ...values });
          showSnackbar("Movement updated successfully.", "success");
        } else {
          await createMovementMutation.mutateAsync(values);
          showSnackbar("Movement created successfully.", "success");
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
    setUpdatingMovement(false);
    setMovementData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    MovementFormik.resetForm();
    setUpdatingMovement(false);
    setMovementData(null);
  }, [MovementFormik]);

  const handleEdit = useCallback((movement: Movement) => {
    setMovementData(movement);
    setUpdatingMovement(true);
    setOpen(true);
  }, []);

  const columns: GridColDef[] = [
    { 
      field: 'palletCode', 
      headerName: 'Pallet Code', 
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'movementType', 
      headerName: 'Movement Type', 
      flex: 1,
      minWidth: 140
    },
    { 
      field: 'fromStackCode', 
      headerName: 'From Stack', 
      flex: 1,
      minWidth: 120,
    },
    { 
      field: 'toStackCode', 
      headerName: 'To Stack', 
      flex: 1,
      minWidth: 120,
    },
    { 
      field: 'fromLocation', 
      headerName: 'From', 
      flex: 1,
      minWidth: 100
    },
    { 
      field: 'toLocation', 
      headerName: 'To', 
      flex: 1,
      minWidth: 100
    },
    { 
      field: 'operatorName', 
      headerName: 'Operator Name', 
      flex: 1,
      minWidth: 120,
    },
   
    { 
      field: 'moveAt', 
      headerName: 'Moved At', 
      flex: 1, 
      minWidth: 120,
      renderCell:(params)=>dateFormatter(params.value) 
    },
     { 
      field: 'returnCondition', 
      headerName: 'Return Condition', 
      flex: 1,
      minWidth: 120,
      renderCell:(params)=>(
      <Box sx={{ marginTop:"10px",borderRadius:"16px", display:"flex", justifyContent:"center", alignItems:"center",width: params.value === "GOOD" ? "60px" : params.value === "DAMAGED" ? "80px" : "90px", padding:"4px", backgroundColor: params.value === "GOOD" ? "#ECFDF3": params.value === "DAMAGED" ? "#FEF3F2" : params.value == "REPAIRABLE" ?  "#F2F4F7" :""}}>
        <Typography sx={{ fontSize:"12px", fontWeight:"500", textAlign:"center", color:params.value === "GOOD" ? "#027A48": params.value === "DAMAGED" ? "#B42318": params.value === "REPAIRABLE" ? "#344054" :""}}>{params.value}</Typography>
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
            <IconButton size={isSmallMobile ? "small" : "medium"} onClick={() => handleEdit(params.row as Movement)}>
              <img src={editIcon} alt="editIcon" style={{ width: isSmallMobile ? "18px" : "21px", height: isSmallMobile ? "18px" : "21px" }}/>
            </IconButton>
            <IconButton size={isSmallMobile ? "small" : "medium"} onClick={() => { handleOpenDeleteModal(params?.row?.code); setMovementCode(params?.row?.moveId) }}>
              <img src={deleteIcon} alt="deleteIconSmall" style={{ width: isSmallMobile ? "20px" : "24px", height: isSmallMobile ? "20px" : "24px"}}/>
            </IconButton>
            <IconButton size={isSmallMobile ? "small" : "medium"}>
              <img src={dotsVertical} alt="deleteIconSmall" style={{ width: isSmallMobile ? "20px" : "24px", height: isSmallMobile ? "20px" : "24px" }}/>
            </IconButton>
          </Box>
        );
      }
    },
  ];
  const {data:getStackResponse} = useGetStacks();
  const stackList = getStackResponse?.data;

    // export as csv functionality here...
    const exportMovementsMutation = useExportMovements(); 
    const handleExport = async () => {
        try {
            const blob = await exportMovementsMutation.mutateAsync();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `movements_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            const err = error as AxiosError<{message?: string}>;
            showSnackbar(err.response?.data.message || err.message, "error");
        }
    };


  return (
    <Box sx={{ overflow:"hidden", width: "100%", minHeight: "100vh"}}>
      <Box sx={{ width: "100%",  display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" },gap: { xs: 2, sm: 0 }}}>
        <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: "auto" }}}>
          <IconButton onClick={() => navigate(-1)} size={isSmallMobile ? "small" : "medium"}>
            <ArrowBackIosNewIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </IconButton>
          <Typography sx={{ fontSize: { xs: "20px", sm: "25px" }, fontWeight: "600", color: "#032541" }}>
            Movements
          </Typography>
        </Box>
         <CustomAddButton style={{ width:"150px"}} variant="contained"  label="Add Movement" onClick={handleOpen}
        />
      </Box>

      <Box sx={{ width: "100%", marginTop: { xs: "-16px", sm: "-10px" }, marginLeft: { xs: "30px", sm: "40px" }}}>
        <Breadcrumbs style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }} aria-label="breadcrumb" separator={<FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }} />}>
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
      <Box sx={{ marginTop: { xs: "20px", sm: "0px" }}}>
      <Box sx={{ display: "flex", width: "100%", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", marginTop: "20px", gap: { xs: 2, sm: 0 }}}>
        <Box sx={{ order: { xs: 2, sm: 1 }, width: { xs: "100%", sm: "auto" }}}>
          <Button 
            variant="contained" 
            onClick={handleExport} 
            disabled={exportMovementsMutation.isPending} 
            endIcon={exportMovementsMutation.isPending ? <CircularProgress thickness={5} size={16} sx={{ color:"#333" }}  /> : <img src={menuIcon} alt="menu icon"/>}
            sx={{ 
              backgroundColor: '#f5f6f7', 
              borderRadius:"8px", 
              ":hover":{boxShadow:"none"}, 
              height:"48px", 
              border:"1px solid #333", 
              boxShadow:"none", 
              textWrap:"nowrap",
              color:'#032541', 
              textTransform: 'none', 
              fontSize: '14px', 
              fontWeight:"500",
              width: { xs: "100%", sm: "auto" }
            }}>
            {exportMovementsMutation.isPending ? 'Exporting...' : 'Export CSV'}
          </Button>
        </Box>

        <Box sx={{ display:"flex", flexDirection: { xs: "column", sm: "row" }, gap:"20px", alignItems: { xs: "stretch", sm: "center" },order: { xs: 1, sm: 2 }, width: { xs: "100%", sm: "auto" }}}>
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
                  sx={{ 
                    borderRadius:"8px", 
                    borderColor:"#D1D5DB", 
                    textTransform:"none", 
                    color:"#333", 
                    height: '40px',
                    width: { xs: "100%", sm: "auto" }
                  }}>
                  Clear dates
                </Button>
              )}
            </LocalizationProvider>
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "10px", width: { xs: "100%", sm: "auto" }}}>
            <Box sx={{ width: { xs: "100%", sm: "200px" } }}>
              <Select  
                displayEmpty
                renderValue={value => value === '' ? 'Select movement type' : value}
                size="small"
                sx={{ 
                  width:"100%",
                  '& .MuiOutlinedInput-notchedOutline': { borderWidth:"1px", borderColor: '#D1D5DB'},
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth:"1px", borderColor: '#D1D5DB' }
                }}   
                id="type"  
                value={type} 
                onChange={handleChangeType}
              >
                <MenuItem value={"STACK_IN"}>Stack In</MenuItem>
                <MenuItem value={"STACK_OUT"}>Stack Out</MenuItem>
                <MenuItem value={"DISPATCH"}>Dispatch</MenuItem>
                <MenuItem value={"RETURN"}>Return</MenuItem>
                <MenuItem value={"REPAIR_IN"}>Repair In</MenuItem>
                <MenuItem value={"REPAIR_OUT"}>Repair_Out</MenuItem>
                <MenuItem value={"QUARANTINE"}>Quarantine</MenuItem>
                <MenuItem value={"SCRAP"}>Scrap</MenuItem>
                <MenuItem value={"TRANSFER"}>Transfar</MenuItem>
                <MenuItem value={"REPAIR_OUT"}>Repair_Out</MenuItem>
              </Select>
            </Box>
            <CustomSearchTextField value={searchTerm} onChange={handleSearchChange} placeholder="Search movement..." sx={{ width: { xs: "100%", sm: "auto" } }}/>
          </Box>
        </Box>
      </Box>

      {/* movement modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={getModalStyle(isMobile)}>
          <form style={{ width: "100%" }} onSubmit={MovementFormik.handleSubmit}>
            <Typography sx={{ fontSize: { xs: "18px", sm: "20px" }, fontWeight: "700" }}>
              {updatingMovement ? "Update Movement Details" : "Add Movement"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <Box sx={{ width:"100%", display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "15px"}}>
                <Box sx={{ width: { xs: "100%", sm: "50%" }}}>
                  <CustomSelect
                  id="palletCode"
                  name="palletCode"
                  label="Pallet"
                  searchable
                  options={pallets?.map((pallet)=>({
                    value:pallet.code,
                    label:pallet.code
                  }))}
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.palletCode}
                  onBlur={MovementFormik.handleBlur}
                  error={MovementFormik.touched.palletCode && Boolean(MovementFormik.errors.palletCode)}
                  helperText={MovementFormik.touched.palletCode && MovementFormik.errors.palletCode}
                />
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
                  <CustomSelect
                  id="movementType"
                  name="movementType"
                  label="Movement Type"
                  searchable
                  options={[
                    {value:"STACK_IN",label:"STACK IN"},
                    {value:"STACK_OUT",label:"STACK OUT"},
                    {value:"DISPATCH",label:"DISPATCH"},
                    {value:"RETURN",label:"RETURN"},
                    {value:"REPAIR_IN",label:"REPAIR IN"},
                    {value:"REPAIR_OUT",label:"REPAIR OUT"},
                    {value:"QUARANTINE",label:"QUARANTINE"},
                    {value:"SCRAP",label:"SCRAP"},
                    {value:"TRANSFER",label:"TRANSFER"},
                  ]}
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.movementType}
                  onBlur={MovementFormik.handleBlur}
                  error={MovementFormik.touched.movementType && Boolean(MovementFormik.errors.movementType)}
                  helperText={MovementFormik.touched.movementType && MovementFormik.errors.movementType}
                />
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "15px" }}>
                <Box sx={{ width: { xs: "100%", sm: "50%" }}}>
                <CustomSelect
                  id="fromStackCode"
                  name="fromStackCode"
                  label="Stack From"
                  searchable
                  options={stackList?.map((stack)=>({
                    value:stack.code,
                    label:stack.warehouse
                  }))}
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.fromStackCode}
                  onBlur={MovementFormik.handleBlur}
                  error={MovementFormik.touched.fromStackCode && Boolean(MovementFormik.errors.fromStackCode)}
                  helperText={MovementFormik.touched.fromStackCode && MovementFormik.errors.fromStackCode}
                />
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "50%" }}}>
               <CustomSelect
                  id="toStackCode"
                  name="toStackCode"
                  label="Stack To"
                  searchable
                   options={stackList?.map((stack)=>({
                      value:stack.code,
                      label:stack.warehouse
                  }))}
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.toStackCode}
                  onBlur={MovementFormik.handleBlur}
                  error={MovementFormik.touched.toStackCode && Boolean(MovementFormik.errors.toStackCode)}
                  helperText={MovementFormik.touched.toStackCode && MovementFormik.errors.toStackCode}
                />
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "15px" }}>
                <CustomTextField
                  id="fromLocation"
                  name="fromLocation"
                  label="From Location"
                  type="text"
                  placeholder="Source Location"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.fromLocation}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.fromLocation && MovementFormik.errors.fromLocation}
                  sx={{ width: { xs: "100%", sm: "50%" } }}
                />
                <CustomTextField
                  id="toLocation"
                  name="toLocation"
                  label="To Location"
                  type="text"
                  placeholder="Destination Location"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.toLocation}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.toLocation && MovementFormik.errors.toLocation}
                  sx={{ width: { xs: "100%", sm: "50%" } }}
                />
              </Box>
              <Box sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: "15px" 
              }}>
                <CustomTextField
                  id="reference"
                  type="text"
                  name="reference"
                  label="Reference"
                  placeholder="Reference"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.reference}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.reference && MovementFormik.errors.reference}
                  sx={{ width: { xs: "100%", sm: "50%" } }}
                />
                <CustomTextField
                  id="operatorName"
                  type="text"
                  name="operatorName"
                  label="Operator Name"
                  placeholder="Operator Name"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.operatorName}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.operatorName && MovementFormik.errors.operatorName}
                  sx={{ width: { xs: "100%", sm: "50%" } }}
                />
              </Box>
              <CustomSelect
                  id="returnCondition"
                  name="returnCondition"
                  label="Return Condition"
                  searchable
                  options={[
                    { value: "GOOD", label: "Good" },
                    { value: "DAMAGED", label: "Damaged" },
                    { value: "REPAIRABLE", label: "Repairable" },
                  ]}
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.returnCondition}
                  onBlur={MovementFormik.handleBlur}
                  error={MovementFormik.touched.returnCondition && Boolean(MovementFormik.errors.returnCondition)}
                  helperText={MovementFormik.touched.returnCondition && MovementFormik.errors.returnCondition}
                />
               <CustomTextField
                id="notes"
                rows={4}
                type="text"
                multiline
                name="notes"
                label="Notes"
                placeholder="Notes"
                onChange={MovementFormik.handleChange}
                value={MovementFormik.values.notes}
                onBlur={MovementFormik.handleBlur}
                errorMessage={MovementFormik.touched.notes && MovementFormik.errors.notes}
              />
              <Box sx={{ marginBottom: "20px", marginTop: "10px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <CustomCancelButton onClick={handleClose} label="Cancel" sx={{ width: { xs: "100%", sm: "auto" } }}/>
                <CustomSubmitButton loading={MovementFormik.isSubmitting} label={updatingMovement ? "Update Movement" : "Create Movement"}sx={{ width: { xs: "100%", sm: "auto" } }}/>
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>

      <CustomDeleteComponent
        loading={isDeleting}
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        title={"Delete Movement"}
        onConfirm={handleDeleteMovement}
        itemT0Delete={`${movementCode} movement`}
      />

      <Box sx={{ width: "100%", height: { xs: "400px", sm: "70vh" }, marginTop: "20px" }}>
        <CustomDataGrid
          loading={isLoading}
          rows={movementsList}
          rowCount={rowCount}
          getRowId={(row) => row.moveId}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          columns={columns}
        />
      </Box>
      </Box>
    </Box>
  )
}

export default Movements