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
import { useCreateMovement, useDeleteMovement, useGetMovements, useUpdateMovement } from "../hooks/useMovements";
import { useDebounce } from "../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Movement, CreateMovementPayload, GetAllMovementsResponse } from "../types/movement";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../utils/dateFormatter";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Movements
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

const MovementSchema = Yup.object<CreateMovementPayload>({
  type: Yup.string().required("Please provide movement type."),
  itemId: Yup.string().required("Please provide item ID."),
  itemType: Yup.string().required("Please provide item type."),
  fromLocation: Yup.string().required("Please provide from location."),
  toLocation: Yup.string().required("Please provide to location."),
  quantity: Yup.number().required("Please provide quantity.").min(1, "Quantity must be at least 1"),
  reason: Yup.string().required("Please provide movement reason."),
  performedBy: Yup.string().required("Please provide who performed the movement."),
  priority: Yup.string().required("Please provide movement priority."),
  notes: Yup.string().optional(),
})

const Movements = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteMovementMutation = useDeleteMovement();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteMovementMutation.isPending;
  const { data: movementsList, isLoading } = useGetMovements({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm })
  const createMovementMutation = useCreateMovement();
  const updateMovementMutation = useUpdateMovement();
  const [movementData, setMovementData] = useState<Movement | null>(null)

  const { rows, rowCount } = useMemo(() => {
    if (!movementsList) {
      return { rows: [], rowCount: 0 };
    }
    const response = movementsList as unknown as GetAllMovementsResponse;
    return {
      rows: response.data || [],
      rowCount: response.data.length || 0
    };
  }, [movementsList]);

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
      type: movementData?.type || "",
      itemId: movementData?.itemId || "",
      itemType: movementData?.itemType || "",
      fromLocation: movementData?.fromLocation || "",
      toLocation: movementData?.toLocation || "",
      quantity: movementData?.quantity || 0,
      reason: movementData?.reason || "",
      performedBy: movementData?.performedBy || "",
      priority: movementData?.priority || "",
      notes: movementData?.notes || "",
    },
    validationSchema: MovementSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingMovement && movementData) {
          await updateMovementMutation.mutateAsync({ code: movementData.code, ...values });
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

  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'itemId', headerName: 'Item ID', flex: 1 },
    { field: 'itemType', headerName: 'Item Type', flex: 1 },
    { field: 'fromLocation', headerName: 'From', flex: 1 },
    { field: 'toLocation', headerName: 'To', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'reason', headerName: 'Reason', flex: 1 },
    { field: 'performedBy', headerName: 'Performed By', flex: 1 },
    { field: 'priority', headerName: 'Priority', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'completedAt', headerName: 'Completed At', flex: 1,
      renderCell: (params) => params.value ? dateFormatter(params.value) : 'Pending'
    },
    {
      field: 'createdAt', headerName: 'Created At', flex: 1,
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as Movement)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={() => { handleOpenDeleteModal(params?.row?.code); setMovementCode(params?.row?.code) }}>
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
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Movements</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Movement" onClick={handleOpen} />
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
          placeholder="Search movement..."
        />
      </Box>

      {/* movement modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={MovementFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingMovement ? "Update Movement Details" : "Add Movement"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="type"
                  name="type"
                  label="Movement Type"
                  type="text"
                  placeholder="e.g., Transfer, Relocation"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.type}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.type && MovementFormik.errors.type}
                />
                <CustomTextField
                  id="priority"
                  name="priority"
                  label="Priority"
                  type="text"
                  placeholder="e.g., High, Medium, Low"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.priority}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.priority && MovementFormik.errors.priority}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="itemId"
                  name="itemId"
                  label="Item ID"
                  type="text"
                  placeholder="Item Identifier"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.itemId}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.itemId && MovementFormik.errors.itemId}
                />
                <CustomTextField
                  id="itemType"
                  name="itemType"
                  label="Item Type"
                  type="text"
                  placeholder="e.g., Asset, Pallet, Stack"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.itemType}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.itemType && MovementFormik.errors.itemType}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
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
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="quantity"
                  type="number"
                  name="quantity"
                  label="Quantity"
                  placeholder="Quantity to move"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.quantity}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.quantity && MovementFormik.errors.quantity}
                />
                <CustomTextField
                  id="performedBy"
                  type="text"
                  name="performedBy"
                  label="Performed By"
                  placeholder="Person performing movement"
                  onChange={MovementFormik.handleChange}
                  value={MovementFormik.values.performedBy}
                  onBlur={MovementFormik.handleBlur}
                  errorMessage={MovementFormik.touched.performedBy && MovementFormik.errors.performedBy}
                />
              </Box>
              <CustomTextField
                id="reason"
                type="text"
                name="reason"
                label="Reason"
                placeholder="Reason for movement"
                onChange={MovementFormik.handleChange}
                value={MovementFormik.values.reason}
                onBlur={MovementFormik.handleBlur}
                errorMessage={MovementFormik.touched.reason && MovementFormik.errors.reason}
              />
              <CustomTextField
                id="notes"
                type="text"
                name="notes"
                label="Notes"
                placeholder="Additional notes (Optional)"
                onChange={MovementFormik.handleChange}
                value={MovementFormik.values.notes}
                onBlur={MovementFormik.handleBlur}
                errorMessage={MovementFormik.touched.notes && MovementFormik.errors.notes}
              />
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
                  loading={MovementFormik.isSubmitting}
                  label={updatingMovement ? "Update Movement" : "Create Movement"}
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
        title={"Delete Movement"}
        onConfirm={handleDeleteMovement}
        itemT0Delete={`${movementCode} movement`}
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

export default Movements
