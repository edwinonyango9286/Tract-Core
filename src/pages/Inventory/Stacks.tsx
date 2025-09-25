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
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  paddingY: "10px",
  paddingX: "30px",
  borderRadius: "8px",
  maxHeight: "90vh",
  overflowY: "auto"
};

const StackSchema = Yup.object<CreateStackPayload>({
  warehouse: Yup.string().required("Please provide stack warehouse."),
  zone: Yup.string().required("Please provide stack zone."),
  capacity: Yup.number().required("Please provide maximum capacity.").min(0, "Capacity must be positive"),
  description: Yup.string().required("Please provide stack description."),
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
      warehouse: stackData?.warehouse || "",
      zone: stackData?.zone || "",
      capacity: stackData?.capacity || 0,
      description: stackData?.description || "",
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

  const columns: GridColDef[] = [
    { field: 'warehouse', headerName: 'Warehouse', flex: 1 },
    { field: 'zone', headerName: 'Zone', flex: 1 },
    { field: 'capacity', headerName: 'Capacity', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
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
            <IconButton onClick={() => { handleOpenDeleteModal(params?.row?.code); setStackName(params?.row?.code) }}>
              <img src={deleteIcon} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
            <IconButton>
              <img src={dotsVertical} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
          </Box>
        );
      }
    },
  ];

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
                <CustomTextField
                  id="warehouse"
                  type="warehouse"
                  name="warehouse"
                  label="Warehouse"
                  placeholder="Warehouse"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.warehouse}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.warehouse && StackFormik.errors.warehouse}
                />
                <CustomTextField
                  id="capacity"
                  type="number"
                  name="capacity"
                  label="Capacity"
                  placeholder="Capacity"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.capacity}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.capacity && StackFormik.errors.capacity}
                />
              
                <CustomTextField
                  id="zone"
                  type="text"
                  name="zone"
                  label="Zone"
                  placeholder="Zone"
                  onChange={StackFormik.handleChange}
                  value={StackFormik.values.zone}
                  onBlur={StackFormik.handleBlur}
                  errorMessage={StackFormik.touched.zone && StackFormik.errors.zone}
                />
                
              <CustomTextField
                id="description"
                type="text"
                name="description"
                label="Description"
                placeholder="Description"
                onChange={StackFormik.handleChange}
                value={StackFormik.values.description}
                onBlur={StackFormik.handleBlur}
                errorMessage={StackFormik.touched.description && StackFormik.errors.description}
              />
              <Box sx={{ marginBottom: "20px", marginTop: "10px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton  loading={StackFormik.isSubmitting} label={updatingStack ? "Update Stack" : "Create Stack"} />
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
          getRowId={(row) => row.code}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          columns={columns}
        />
      </Box>
    </Box>
  )
}

export default Stacks
