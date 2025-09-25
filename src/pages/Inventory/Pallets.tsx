import { Box, Breadcrumbs, IconButton, Modal, Typography } from "@mui/material"
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

  const columns: GridColDef[] = [
    { field: 'type', headerName: 'type', flex: 1 },
    { field: 'currentStackCode', headerName: 'Current Stack Code', flex: 1 },
    { field: 'currentLocation', headerName: 'Current Location', flex: 1 },
    { field: 'owner', headerName: 'Owner', flex: 1 },
    { field: 'lastReference', headerName: 'Last Reference', flex: 1 },
    { field: 'lastMoveAt', headerName: 'Last Moved At', flex: 1 },
    { field: 'notes', headerName: 'Notes', flex: 1 },
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
  ];

  const {data:stackResponse } = useGetStacks();
  const stackList = stackResponse?.data || [];

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
                <CustomSelect
                  id="type"
                  name="type"
                  label="Type"
                  searchable
                  options={[
                    {value:"Wooden",label:"Wooden"},
                    {value:"Plastic",label:"Plastic"},
                    {value:"Metalic", label:"Metalic"}
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
                  options={stackList?.map((stack:Stack)=>({value:stack.code,label:stack.warehouse}))}
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
              <Box sx={{ marginBottom: "20px", marginTop: "30px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton loading={PalletFormik.isSubmitting} label={updatingPallet ? "Update Pallet" : "Create Pallet"}/>
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
