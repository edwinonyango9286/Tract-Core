import { Box, Breadcrumbs, IconButton, MenuItem, Modal, Select, Typography, type SelectChangeEvent, useTheme, useMediaQuery } from "@mui/material"
import { FiberManualRecord } from "@mui/icons-material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from "react-router-dom";
import type { GridColDef } from "@mui/x-data-grid";
import React, { useCallback, useMemo, useState } from "react";
import editIcon from "../../assets/icons/editIcon.svg";
import deleteIcon from "../../assets/icons/deleteIcon.svg"
import dotsVertical from "../../assets/icons/dotsVertical.svg"
import type { AxiosError } from "axios";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "../../hooks/useSnackbar";
import type { CreatePalletPayload, GetAllPalletsResponse, Pallet } from "../../types/pallet";
import { useCreatePallet, useDeletePallet, useGetPallets, useUpdatePallet } from "../../hooks/usePallets";
import { useDebounce } from "../../hooks/useDebounce";
import { dateFormatter } from "../../utils/dateFormatter";
import CustomAddButton from "../../Components/common/CustomAddButton";
import CustomSearchTextField from "../../Components/common/CustomSearchTextField";
import CustomTextField from "../../Components/common/CustomTextField";
import CustomCancelButton from "../../Components/common/CustomCancelButton";
import CustomSubmitButton from "../../Components/common/CustomSubmitButton";
import CustomDeleteComponent from "../../Components/common/CustomDeleteComponent";
import CustomDataGrid from "../../Components/common/CustomDataGrid";
import CustomSelect from "../../Components/common/CustomSelect";
import { useGetStacks } from "../../hooks/useStacks";
import type { Stack } from "../../types/stack";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Pallets
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
  maxHeight: "90vh",
  overflowY: "auto"
});

const PalletSchema = Yup.object<CreatePalletPayload>({
  type: Yup.string().required("Please provide select pallet type."),
  owner: Yup.string().required("Please provide pallet owner."),
  initialStackCode: Yup.string().required("Please select pallet stack."),
  initialLocation: Yup.string().required("Please provide pallet location."),
  notes: Yup.string() 
})

const Pallets = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deletePalletMutation = useDeletePallet();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deletePalletMutation.isPending;

  // Responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [status, setStatus] = useState<string>("");
  const handleChangeStatus = (e: SelectChangeEvent<string>) => {
    setStatus(e.target.value);
  }
  const { data: palletsList, isLoading } = useGetPallets({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm, status })
  const createPalletMutation = useCreatePallet();
  const updatePalletMutation = useUpdatePallet();
  const [palletData, setPalletData] = useState<Pallet | null>(null);

  const { rows, rowCount } = useMemo(() => {
    if (!palletsList) {
      return { rows: [], rowCount: 0 };
    }
    const response = palletsList as unknown as GetAllPalletsResponse;
    return {
      rows: response.data.content || [],
      rowCount: response.data.totalElements || 0
    };
  }, [palletsList]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedPalletId, setSelectedPalletId] = useState<string>("");
  const [palletName, setPalletName] = useState<string>("");

  const handleOpenDeleteModal = (palletId: string) => {
    setOpenDeleteModal(true);
    setSelectedPalletId(palletId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedPalletId("");
    setPalletName("");
  }
  const [open, setOpen] = useState(false);

  const handleDeletePallet = useCallback(async () => {
    if (selectedPalletId) {
      try {
        await deletePalletMutation.mutateAsync(selectedPalletId);
        showSnackbar("Pallet deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedPalletId, showSnackbar, deletePalletMutation])

  const [updatingPallet, setUpdatingPallet] = useState<boolean>(false)
  const PalletFormik = useFormik<CreatePalletPayload>({
    initialValues: {
      type: palletData?.type || "",
      owner: palletData?.owner || "",
      initialStackCode: palletData?.currentStackCode || "",
      initialLocation: palletData?.currentLocation || "",
      notes: palletData?.notes || "",
    },
    validationSchema: PalletSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingPallet && palletData) {
          await updatePalletMutation.mutateAsync({ code: palletData.code, ...values });
          showSnackbar("Pallet updated successfully.", "success");
        } else {
          await createPalletMutation.mutateAsync(values);
          showSnackbar("Pallet created successfully.", "success");
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
    setUpdatingPallet(false);
    setPalletData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    PalletFormik.resetForm();
    setUpdatingPallet(false);
    setPalletData(null);
  }, [PalletFormik]);

  const handleEdit = useCallback((pallet: Pallet) => {
    setPalletData(pallet);
    setUpdatingPallet(true);
    setOpen(true);
  }, []);

  // Responsive columns
  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: isSmallMobile ? 80 : 100
    },
    {
      field: 'currentStackCode',
      headerName: 'Current Stack Code',
      flex: 1,
      minWidth: isSmallMobile ? 120 : 150,
      display: isMobile ? 'none' : 'flex' // Hide on mobile
    },
    {
      field: 'currentLocation',
      headerName: 'Current Location',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120
    },
    {
      field: 'owner',
      headerName: 'Owner',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120
    },
    {
      field: 'lastReference',
      headerName: 'Last Reference',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120,
      display: isMobile ? 'none' : 'flex' // Hide on mobile
    },
    {
      field: 'lastMoveAt',
      headerName: 'Last Moved At',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120,
      display: isSmallMobile ? 'none' : 'flex', // Hide on very small screens
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120,
      display: isMobile ? 'none' : 'flex' // Hide on mobile
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: isSmallMobile ? 80 : 100
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120,
      display: isSmallMobile ? 'none' : 'flex', // Hide on very small screens
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      flex: 1,
      minWidth: isSmallMobile ? 100 : 120,
      display: isMobile ? 'none' : 'flex', // Hide on mobile
      renderCell: (params) => dateFormatter(params.value)
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
              onClick={() => handleEdit(params.row as Pallet)}
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
              onClick={() => { handleOpenDeleteModal(params?.row?.code); setPalletName(params?.row?.name) }}
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
            <IconButton
              size={isSmallMobile ? "small" : "medium"}
            >
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
  ];

  const { data: stackResponse } = useGetStacks();
  const stackList = stackResponse?.data || [];

  return (
    <Box sx={{
      width: "100%",
      minHeight: "100vh",
      padding: { xs: "10px", sm: "20px" } // Responsive padding
    }}>
      {/* Header Section */}
      <Box sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Stack on mobile
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          width: { xs: "100%", sm: "auto" }
        }}>
          <IconButton
            onClick={() => navigate(-1)}
            size={isSmallMobile ? "small" : "medium"}
          >
            <ArrowBackIosNewIcon fontSize={isSmallMobile ? "small" : "medium"} />
          </IconButton>
          <Typography sx={{
            fontSize: { xs: "20px", sm: "25px" },
            fontWeight: "600",
            color: "#032541"
          }}>
            Pallets
          </Typography>
        </Box>
        <CustomAddButton
          variant="contained"
          label="Add Pallet"
          onClick={handleOpen}
          sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on mobile
        />
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{
        width: "100%",
        marginTop: { xs: "10px", sm: "-10px" },
        marginLeft: { xs: "0px", sm: "40px" }
      }}>
        <Breadcrumbs
          style={{ fontFamily: "Poppins", fontSize: "14px", marginTop: "5px" }}
          aria-label="breadcrumb"
          separator={<FiberManualRecord style={{ fontSize: "0.625rem", fontFamily: "Poppins", color: "#e1e5e8" }} />}
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Box sx={{
        marginLeft: { xs: "0px", sm: "40px" },
        marginTop: { xs: "20px", sm: "0px" }
      }}>
        {/* Filters Section */}
        <Box sx={{
          display: "flex",
          width: "100%",
          flexDirection: { xs: "column", sm: "row" }, // Stack on mobile
          justifyContent: "space-between",
          marginTop: "20px",
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ order: { xs: 2, sm: 1 } }}></Box>
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Stack on mobile
            gap: { xs: "10px", sm: "20px" },
            alignItems: { xs: "stretch", sm: "center" },
            order: { xs: 1, sm: 2 },
            width: { xs: "100%", sm: "auto" }
          }}>
            <Box sx={{ width: { xs: "100%", sm: "200px" } }}>
              <Select
                displayEmpty
                renderValue={value => value === '' ? 'Select Status' : value}
                size="small"
                sx={{
                  height: "45px",
                  width: "100%",
                  '& .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: "1px", borderColor: '#D1D5DB' }
                }}
                id="status"
                value={status}
                onChange={handleChangeStatus}
              >
                <MenuItem value={"IN_STACK"}>In Stack</MenuItem>
                <MenuItem value={"OUTBOUND"}>Out Bound</MenuItem>
                <MenuItem value={"RETURNED"}>Returned</MenuItem>
                <MenuItem value={"IN_REPAIR"}>In Repair</MenuItem>
                <MenuItem value={"QUARANTINE"}>Quarantined</MenuItem>
                <MenuItem value={"SCRAP"}>Scrap</MenuItem>
              </Select>
            </Box>
            <CustomSearchTextField
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search pallet..."
              sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on mobile
            />
          </Box>
        </Box>

        {/* Pallet Modal */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={getModalStyle(isMobile)}>
            <form style={{ width: "100%" }} onSubmit={PalletFormik.handleSubmit}>
              <Typography sx={{ fontSize: { xs: "18px", sm: "20px" }, fontWeight: "700" }}>
                {updatingPallet ? "Update Pallet Details" : "Add Pallet"}
              </Typography>
              <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <CustomSelect
                  id="type"
                  name="type"
                  label="Type"
                  searchable
                  options={[
                    { value: "PLASTIC", label: "Plastic" },
                    { value: "EURO", label: "Euro" },
                    { value: "WOODEN", label: "Wooden" },
                    { value: "HEAVY_DUTY", label: "Heavy Duty" },
                  ]}
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.type}
                  onBlur={PalletFormik.handleBlur}
                  error={PalletFormik.touched.type && Boolean(PalletFormik.errors.type)}
                  helperText={PalletFormik.touched.type && PalletFormik.errors.type}
                />
                <CustomTextField
                  id="owner"
                  name="owner"
                  label="Pallet Owner"
                  type="text"
                  placeholder="Pallet Owner"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.owner}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.owner && PalletFormik.errors.owner}
                />
                <CustomSelect
                  id="initialStackCode"
                  name="initialStackCode"
                  label="Initial Stack"
                  searchable
                  options={stackList?.map((stack: Stack) => ({ value: stack.code, label: stack.warehouse }))}
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.initialStackCode}
                  onBlur={PalletFormik.handleBlur}
                  error={PalletFormik.touched.initialStackCode && Boolean(PalletFormik.errors.initialStackCode)}
                  helperText={PalletFormik.touched.initialStackCode && PalletFormik.errors.initialStackCode}
                />
                <CustomTextField
                  id="initialLocation"
                  type="initialLocation"
                  name="initialLocation"
                  label="Initial Location"
                  placeholder="Initial Location"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.initialLocation}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.initialLocation && PalletFormik.errors.initialLocation}
                />
                <CustomTextField
                  id="notes"
                  type="text"
                  name="notes"
                  label="Notes"
                  placeholder="Notes"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.notes}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.notes && PalletFormik.errors.notes}
                />
              </Box>
              <Box sx={{
                marginBottom: "20px",
                marginTop: "30px",
                gap: "20px",
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" }, // Stack buttons on mobile
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <CustomCancelButton
                  onClick={handleClose}
                  label="Cancel"
                  sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on mobile
                />
                <CustomSubmitButton
                  loading={PalletFormik.isSubmitting}
                  label={updatingPallet ? "Update Pallet" : "Create Pallet"}
                  sx={{ width: { xs: "100%", sm: "auto" } }} // Full width on mobile
                />
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Delete Modal */}
        <CustomDeleteComponent
          loading={isDeleting}
          open={openDeleteModal}
          onClose={handleCloseDeleteModal}
          title={"Delete Pallet"}
          onConfirm={handleDeletePallet}
          itemT0Delete={`Selected pallet`}
        />

        {/* DataGrid */}
        <Box sx={{
          width: "100%",
          height: { xs: "400px", sm: "70vh" }, // Adjust height for mobile
          marginTop: "20px",
          overflow: "auto"
        }}>
          <CustomDataGrid
            loading={isLoading}
            rows={rows}
            rowCount={rowCount}
            getRowId={(row) => row.code}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            columns={columns}
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' } // Smaller font on mobile
              },
              '& .MuiDataGrid-columnHeader': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' } // Smaller header font on mobile
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Pallets