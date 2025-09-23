import { Box, Breadcrumbs, IconButton, Modal, Typography } from "@mui/material"
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
import { useCreateStack, useDeleteStack, useGetStacks, useUpdateStack } from "../../hooks/useStacks";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Stack, CreateStackPayload, GetAllStacksResponse } from "../../types/stack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../../utils/dateFormatter";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Stacks
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

const StackSchema = Yup.object<CreateStackPayload>({
  name: Yup.string().required("Please provide stack name."),
  description: Yup.string().required("Please provide stack description."),
  type: Yup.string().required("Please provide stack type."),
  height: Yup.number().required("Please provide stack height.").min(0, "Height must be positive"),
  maxCapacity: Yup.number().required("Please provide maximum capacity.").min(0, "Capacity must be positive"),
  currentLoad: Yup.number().required("Please provide current load.").min(0, "Load must be positive"),
  location: Yup.string().required("Please provide stack location."),
  status: Yup.string().required("Please provide stack status."),
  palletId: Yup.string().optional(),
  zone: Yup.string().optional(),
})

const Stacks = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteStackMutation = useDeleteStack();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteStackMutation.isPending;
  const { data: stacksList, isLoading } = useGetStacks({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm })
  const createStackMutation = useCreateStack();
  const updateStackMutation = useUpdateStack();
  const [stackData, setStackData] = useState<Stack | null>(null)

  const { rows, rowCount } = useMemo(() => {
    if (!stacksList) {
      return { rows: [], rowCount: 0 };
    }
    const response = stacksList as unknown as GetAllStacksResponse;
    return {
      rows: response.data || [],
      rowCount: response.data.length || 0
    };
  }, [stacksList]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }, [])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedStackId, setSelectedStackId] = useState<string>("");
  const [stackName, setStackName] = useState<string>("");

  const handleOpenDeleteModal = (stackId: string) => {
    setOpenDeleteModal(true);
    setSelectedStackId(stackId);
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedStackId("");
    setStackName("");
  }
  const [open, setOpen] = useState(false);

  const handleDeleteStack = useCallback(async () => {
    if (selectedStackId) {
      try {
        await deleteStackMutation.mutateAsync(selectedStackId);
        showSnackbar("Stack deleted successfully.", "success");
        handleCloseDeleteModal();
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        showSnackbar(err.response?.data.message || err.message)
      }
    }
  }, [selectedStackId, showSnackbar, deleteStackMutation])

  const [updatingStack, setUpdatingStack] = useState<boolean>(false)
  const StackFormik = useFormik<CreateStackPayload>({
    initialValues: {
      name: stackData?.name || "",
      description: stackData?.description || "",
      type: stackData?.type || "",
      height: stackData?.height || 0,
      maxCapacity: stackData?.maxCapacity || 0,
      currentLoad: stackData?.currentLoad || 0,
      location: stackData?.location || "",
      status: stackData?.status || "",
      palletId: stackData?.palletId || "",
      zone: stackData?.zone || "",
    },
    validationSchema: StackSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (updatingStack && stackData) {
          await updateStackMutation.mutateAsync({ code: stackData.code, ...values });
          showSnackbar("Stack updated successfully.", "success");
        } else {
          await createStackMutation.mutateAsync(values);
          showSnackbar("Stack created successfully.", "success");
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
    setUpdatingStack(false);
    setStackData(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    StackFormik.resetForm();
    setUpdatingStack(false);
    setStackData(null);
  }, [StackFormik]);

  const handleEdit = useCallback((stack: Stack) => {
    setStackData(stack);
    setUpdatingStack(true);
    setOpen(true);
  }, []);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'zone', headerName: 'Zone', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'height', headerName: 'Height (m)', flex: 1,
      renderCell: (params) => `${params.value || 0} m`
    },
    {
      field: 'currentLoad', headerName: 'Current Load', flex: 1,
      renderCell: (params) => {
        const current = params.value || 0;
        const max = params.row.maxCapacity || 0;
        const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
        return `${current}/${max} (${percentage}%)`;
      }
    },
    {
      field: 'maxCapacity', headerName: 'Max Capacity', flex: 1,
      renderCell: (params) => `${params.value || 0} units`
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
            <IconButton onClick={() => handleEdit(params.row as Stack)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={() => { handleOpenDeleteModal(params?.row?.code); setStackName(params?.row?.name) }}>
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
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Stacks</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Stack" onClick={handleOpen} />
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
          placeholder="Search stack..."
        />
      </Box>

      {/* stack modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={StackFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingStack ? "Update Stack Details" : "Add Stack"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="name"
                  name="name"
                  label="Name"
                  type="text"
                  placeholder="Stack Name"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.name}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.name && StackFormik.errors.name}
                />
                <CustomTextField
                  id="type"
                  name="type"
                  label="Type"
                  type="text"
                  placeholder="e.g., Storage, Buffer"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.type}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.type && StackFormik.errors.type}
                />
              </Box>
              <CustomTextField
                id="description"
                type="text"
                name="description"
                label="Description"
                placeholder="Stack Description"
                onChange={StackFormik.handleChange}
                value={StackFormik.values.description}
                onBlur={StackFormik.handleBlur}
                errorMessage={StackFormik.touched.description && StackFormik.errors.description}
              />
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="height"
                  type="number"
                  name="height"
                  label="Height (m)"
                  placeholder="Height in meters"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.height}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.height && StackFormik.errors.height}
                />
                <CustomTextField
                  id="maxCapacity"
                  type="number"
                  name="maxCapacity"
                  label="Max Capacity"
                  placeholder="Maximum capacity"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.maxCapacity}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.maxCapacity && StackFormik.errors.maxCapacity}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="currentLoad"
                  type="number"
                  name="currentLoad"
                  label="Current Load"
                  placeholder="Current load"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.currentLoad}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.currentLoad && StackFormik.errors.currentLoad}
                />
                <CustomTextField
                  id="status"
                  type="text"
                  name="status"
                  label="Status"
                  placeholder="e.g., Active, Inactive"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.status}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.status && StackFormik.errors.status}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="location"
                  type="text"
                  name="location"
                  label="Location"
                  placeholder="Stack Location"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.location}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.location && StackFormik.errors.location}
                />
                <CustomTextField
                  id="zone"
                  type="text"
                  name="zone"
                  label="Zone"
                  placeholder="Zone (Optional)"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.zone}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.zone && StackFormik.errors.zone}
                />
              </Box>
              <CustomTextField
                id="palletId"
                type="text"
                name="palletId"
                label="Pallet ID"
                placeholder="Associated Pallet ID (Optional)"
                onChange={StackFormik.handleChange}
                value={StackFormik.values.palletId}
                onBlur={StackFormik.handleBlur}
                errorMessage={StackFormik.touched.palletId && StackFormik.errors.palletId}
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
                  loading={StackFormik.isSubmitting}
                  label={updatingStack ? "Update Stack" : "Create Stack"}
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
        title={"Delete Stack"}
        onConfirm={handleDeleteStack}
        itemT0Delete={`${stackName} stack`}
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

export default Stacks
