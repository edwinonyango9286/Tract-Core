import { Box, Breadcrumbs, IconButton, Modal, Typography } from "@mui/material"
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
import { useCreatePallet, useDeletePallet, useGetPallets, useUpdatePallet } from "../hooks/usePallets";
import { useDebounce } from "../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Pallet, CreatePalletPayload, GetAllPalletsResponse } from "../types/pallet";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../utils/dateFormatter";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Pallets
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

const PalletSchema = Yup.object<CreatePalletPayload>({
  name: Yup.string().required("Please provide pallet name."),
  description: Yup.string().required("Please provide pallet description."),
  type: Yup.string().required("Please provide pallet type."),
  dimensions: Yup.string().required("Please provide pallet dimensions."),
  weight: Yup.number().required("Please provide pallet weight.").min(0, "Weight must be positive"),
  capacity: Yup.number().required("Please provide pallet capacity.").min(0, "Capacity must be positive"),
  material: Yup.string().required("Please provide pallet material."),
  condition: Yup.string().required("Please provide pallet condition."),
  location: Yup.string().required("Please provide pallet location."),
  status: Yup.string().required("Please provide pallet status."),
  supplier: Yup.string().optional(),
})

const Pallets = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deletePalletMutation = useDeletePallet();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deletePalletMutation.isPending;
  const { data: palletsList, isLoading } = useGetPallets({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm })
  const createPalletMutation = useCreatePallet();
  const updatePalletMutation = useUpdatePallet();
  const [palletData, setPalletData] = useState<Pallet | null>(null)

  const { rows, rowCount } = useMemo(() => {
    if (!palletsList) {
      return { rows: [], rowCount: 0 };
    }
    const response = palletsList as unknown as GetAllPalletsResponse;
    return {
      rows: response.data || [],
      rowCount: response.data.length || 0
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
      name: palletData?.name || "",
      description: palletData?.description || "",
      type: palletData?.type || "",
      dimensions: palletData?.dimensions || "",
      weight: palletData?.weight || 0,
      capacity: palletData?.capacity || 0,
      material: palletData?.material || "",
      condition: palletData?.condition || "",
      location: palletData?.location || "",
      status: palletData?.status || "",
      supplier: palletData?.supplier || "",
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

  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'dimensions', headerName: 'Dimensions', flex: 1 },
    { field: 'material', headerName: 'Material', flex: 1 },
    { field: 'condition', headerName: 'Condition', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'weight', headerName: 'Weight (kg)', flex: 1,
      renderCell: (params) => `${params.value || 0} kg`
    },
    {
      field: 'capacity', headerName: 'Capacity (kg)', flex: 1,
      renderCell: (params) => `${params.value || 0} kg`
    },
    {
      field: 'createdAt', headerName: 'Created At', flex: 1,
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: 'updatedAt', headerName: 'Updated At', flex: 1,
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as Pallet)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={() => { handleOpenDeleteModal(params?.row?.code); setPalletName(params?.row?.name) }}>
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
    <Box sx={{ width: "100%", height: "100vh" }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ width: "100%", alignItems: "center", display: "flex" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Pallets</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Pallet" onClick={handleOpen} />
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
          placeholder="Search pallet..."
        />
      </Box>

      {/* pallet modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={PalletFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingPallet ? "Update Pallet Details" : "Add Pallet"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Pallet Name"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.name}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.name && PalletFormik.errors.name}
                />
                <CustomTextField
                  id="type"
                  name="type"
                  label="Type"
                  type="text"
                  placeholder="Pallet Type"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.type}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.type && PalletFormik.errors.type}
                />
              </Box>
              <CustomTextField
                id="description"
                type="text"
                name="description"
                label="Description"
                placeholder="Pallet Description"
                onChange={PalletFormik.handleChange}
                value={PalletFormik.values.description}
                onBlur={PalletFormik.handleBlur}
                errorMessage={PalletFormik.touched.description && PalletFormik.errors.description}
              />
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="dimensions"
                  type="text"
                  name="dimensions"
                  label="Dimensions"
                  placeholder="e.g., 120x80x15 cm"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.dimensions}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.dimensions && PalletFormik.errors.dimensions}
                />
                <CustomTextField
                  id="material"
                  type="text"
                  name="material"
                  label="Material"
                  placeholder="e.g., Wood, Plastic"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.material}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.material && PalletFormik.errors.material}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="weight"
                  type="number"
                  name="weight"
                  label="Weight (kg)"
                  placeholder="Weight in kg"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.weight}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.weight && PalletFormik.errors.weight}
                />
                <CustomTextField
                  id="capacity"
                  type="number"
                  name="capacity"
                  label="Capacity (kg)"
                  placeholder="Capacity in kg"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.capacity}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.capacity && PalletFormik.errors.capacity}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="condition"
                  type="text"
                  name="condition"
                  label="Condition"
                  placeholder="e.g., New, Good, Fair"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.condition}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.condition && PalletFormik.errors.condition}
                />
                <CustomTextField
                  id="status"
                  type="text"
                  name="status"
                  label="Status"
                  placeholder="e.g., Available, In Use"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.status}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.status && PalletFormik.errors.status}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="location"
                  type="text"
                  name="location"
                  label="Location"
                  placeholder="Pallet Location"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.location}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.location && PalletFormik.errors.location}
                />
                <CustomTextField
                  id="supplier"
                  type="text"
                  name="supplier"
                  label="Supplier"
                  placeholder="Supplier (Optional)"
                  onChange={PalletFormik.handleChange}
                  value={PalletFormik.values.supplier}
                  onBlur={PalletFormik.handleBlur}
                  errorMessage={PalletFormik.touched.supplier && PalletFormik.errors.supplier}
                />
              </Box>
              <Box sx={{
                marginBottom: "20px",
                marginTop: "10px",
                gap: "20px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton
                  loading={PalletFormik.isSubmitting}
                  label={updatingPallet ? "Update Pallet" : "Create Pallet"}
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
        title={"Delete Pallet"}
        onConfirm={handleDeletePallet}
        itemT0Delete={`${palletName} pallet`}
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

export default Pallets
