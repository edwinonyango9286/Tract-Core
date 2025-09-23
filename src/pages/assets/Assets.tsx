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
import { useCreateAsset, useDeleteAsset, useGetAssets, useUpdateAsset } from "../../hooks/useAssets";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Asset, CreateAssetPayload, GetAllAssetsResponse } from "../../types/asset";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../../utils/dateFormatter";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Assets
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

const AssetSchema = Yup.object<CreateAssetPayload>({
  name: Yup.string().required("Please provide asset name."),
  description: Yup.string().required("Please provide asset description."),
  category: Yup.string().required("Please provide asset category."),
  subCategory: Yup.string().optional(),
  serialNumber: Yup.string().required("Please provide serial number."),
  purchaseDate: Yup.string().required("Please provide purchase date."),
  purchasePrice: Yup.number().required("Please provide purchase price.").min(0, "Price must be positive"),
  condition: Yup.string().required("Please provide asset condition."),
  location: Yup.string().required("Please provide asset location."),
  assignedTo: Yup.string().optional(),
})

const Assets = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const deleteAssetMutation = useDeleteAsset();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteAssetMutation.isPending;
  const { data: assetsList, isLoading } = useGetAssets({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm })
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const [assetData, setAssetData] = useState<Asset | null>(null)

  const { rows, rowCount } = useMemo(() => {
    if (!assetsList) {
      return { rows: [], rowCount: 0 };
    }
    const response = assetsList as unknown as GetAllAssetsResponse;
    return {
      rows: response.data || [],
      rowCount: response.data.length || 0
    };
  }, [assetsList]);

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
      description: assetData?.description || "",
      category: assetData?.category || "",
      subCategory: assetData?.subCategory || "",
      serialNumber: assetData?.serialNumber || "",
      purchaseDate: assetData?.purchaseDate || "",
      purchasePrice: assetData?.purchasePrice || 0,
      condition: assetData?.condition || "",
      location: assetData?.location || "",
      assignedTo: assetData?.assignedTo || "",
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

  const columns: GridColDef[] = useMemo(() => [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'categoryName', headerName: 'Category Name', flex: 1 },
    { field: 'subCategory', headerName: 'Sub Category Name', flex: 1 },
    { field: 'model', headerName: 'Model', flex: 1 },
    { field: 'serialNumber', headerName: 'Serial Number', flex: 1 },
    { field: 'lastInspectionDate', headerName: 'Last Inspection Date', flex: 1,
      renderCell:(params)=>dateFormatter(params.value)
    },
    { field: 'nextInspectionDue', headerName: 'Next Inspection Due Date', flex: 1,
      renderCell:(params)=>dateFormatter(params.value)
     },
    { field: 'assignedTo', headerName: 'Assigned To', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    {
      field: 'purchaseCost', headerName: 'Purchase Cost', flex: 1,
      renderCell: (params) => `$${params.value?.toLocaleString() || 0}`
    },
    {
      field: 'createdAt', headerName: 'Created At', flex: 1,
      renderCell: (params) => dateFormatter(params.value)
    },
    {
      field: 'updatedAt', headerName: 'Updated At', flex: 1,
      renderCell: (params) => dateFormatter(params.value)
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as Asset)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={() => { handleOpenDeleteModal(params?.row?.code); setAssetName(params?.row?.name) }}>
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
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Assets</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Asset" onClick={handleOpen} />
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
          placeholder="Search asset..."
        />
      </Box>

      {/* asset modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={AssetFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingAsset ? "Update Asset Details" : "Add Asset"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <Box sx={{ display: "flex", gap: "15px" }}>
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
              <CustomTextField
                id="description"
                type="text"
                name="description"
                label="Description"
                placeholder="Asset Description"
                onChange={AssetFormik.handleChange}
                value={AssetFormik.values.description}
                onBlur={AssetFormik.handleBlur}
                errorMessage={AssetFormik.touched.description && AssetFormik.errors.description}
              />
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="category"
                  type="text"
                  name="category"
                  label="Category"
                  placeholder="Category"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.category}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.category && AssetFormik.errors.category}
                />
                <CustomTextField
                  id="subCategory"
                  type="text"
                  name="subCategory"
                  label="Sub Category"
                  placeholder="Sub Category (Optional)"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.subCategory}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.subCategory && AssetFormik.errors.subCategory}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="purchaseDate"
                  type="date"
                  name="purchaseDate"
                  label="Purchase Date"
                  placeholder="Purchase Date"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.purchaseDate}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.purchaseDate && AssetFormik.errors.purchaseDate}
                />
                <CustomTextField
                  id="purchasePrice"
                  type="number"
                  name="purchasePrice"
                  label="Purchase Price"
                  placeholder="Purchase Price"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.purchasePrice}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.purchasePrice && AssetFormik.errors.purchasePrice}
                />
              </Box>
              <Box sx={{ display: "flex", gap: "15px" }}>
                <CustomTextField
                  id="condition"
                  type="text"
                  name="condition"
                  label="Condition"
                  placeholder="Asset Condition"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.condition}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.condition && AssetFormik.errors.condition}
                />
                <CustomTextField
                  id="location"
                  type="text"
                  name="location"
                  label="Location"
                  placeholder="Asset Location"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.location}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.location && AssetFormik.errors.location}
                />
              </Box>
              <CustomTextField
                id="assignedTo"
                type="text"
                name="assignedTo"
                label="Assigned To"
                placeholder="Assigned To (Optional)"
                onChange={AssetFormik.handleChange}
                value={AssetFormik.values.assignedTo}
                onBlur={AssetFormik.handleBlur}
                errorMessage={AssetFormik.touched.assignedTo && AssetFormik.errors.assignedTo}
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
                  loading={AssetFormik.isSubmitting}
                  label={updatingAsset ? "Update Asset" : "Create Asset"}
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
        title={"Delete Asset"}
        onConfirm={handleDeleteAsset}
        itemT0Delete={`${assetName} asset`}
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

export default Assets