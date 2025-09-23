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
import { useFormik, validateYupSchema } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../../utils/dateFormatter";
import CustomSelect from "../../Components/common/CustomSelect";
import { useGetCategories } from "../../hooks/useCategories";
import { useGetSubCategories } from "../../hooks/useSubCategories";
import type { SubCategory } from "../../types/subCategory";
import CustomDatePicker from "../../Components/common/CustomDatePicker";
import type { User } from "../../types/user";
import { useGetUsers } from "../../hooks/useUsers";

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
  width: 600,
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
  const deleteAssetMutation = useDeleteAsset();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const isDeleting = deleteAssetMutation.isPending;
  const { data: assetsList, isLoading } = useGetAssets({ page: paginationModel.page, size: paginationModel.pageSize, search: debouncedSearchTerm })
  const { data:categoriesList} = useGetCategories();
  const { data:subCategoryList} = useGetSubCategories();
  const { data:usersList } = useGetUsers();
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const [assetData, setAssetData] = useState<Asset | null>(null)

  const { rows, rowCount } = useMemo(() => {
    if (!assetsList) {
      return { rows: [], rowCount: 0 };
    }
    const response = assetsList as unknown as GetAllAssetsResponse;
    return {
      rows: response.data.content || [],
      rowCount: response.data.totalElements || 0
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
            <IconButton onClick={() => {handleOpenDeleteModal(params?.row?.code); setAssetName(params?.row?.name) }}>
              <img src={deleteIcon} alt="deleteIconSmall" style={{ width: "24px", height: "24px" }} />
            </IconButton>
            <IconButton>
              <img src={dotsVertical} alt="dotsvertical" style={{ width: "24px", height: "24px" }} />
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
                <Box sx={{ width:"50%"}}>
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
              <Box sx={{ width:"50%"}}>
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
              <Box sx={{ width:"100%", display:"flex", gap:"15px"}}>
                <Box sx={{ width:"50%"}}>
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
                <Box sx={{ width:"50%"}}>
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
              <Box sx={{ display: "flex", gap: "15px" }}>
                <Box sx={{ width:"50%" }}>
                <CustomSelect 
                 label="Category"
                 name="categoryCode"
                 id="categoryCode"
                 value={AssetFormik.values.categoryCode}
                 onChange={AssetFormik.handleChange}
                 onBlur={AssetFormik.handleBlur}
                 searchable
                 options={categoriesList?.data?.map((category)=>({
                  value:category.code,
                  label:category.name
                 }))}
                 error={AssetFormik.touched.categoryCode && Boolean(AssetFormik.errors.categoryCode)}
                 helperText={AssetFormik.touched.categoryCode && AssetFormik.errors.categoryCode}
                />
                </Box>
               
               <Box sx={{ width:"50%"}}>
                <CustomSelect
                  id="subCategory"
                  name="subCategory"
                  label="Sub Category"
                  searchable
                  options={subCategoryList?.data?.data.content?.map((subCategory:SubCategory)=>({
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

              <Box sx={{ width:"100%", display: "flex", gap: "15px" }}>
                <Box sx={{ width: "50%" }}>
                  <CustomDatePicker
                    label="Purchase Date"
                    value={AssetFormik.values.purchaseDate}
                    onChange={(value) => AssetFormik.setFieldValue('purchaseDate', value)}
                    error={AssetFormik.touched.purchaseDate && Boolean(AssetFormik.errors.purchaseDate)}
                    helperText={AssetFormik.touched.purchaseDate && AssetFormik.errors.purchaseDate}
                    required
                  />
              </Box> 
               <Box sx={{ width:"50%"}}>
                <CustomTextField
                  id="purchaseCost"
                  type="number"
                  name="purchaseCost"
                  label="Purchase Cost"
                  placeholder="Purchase Cost"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.purchaseCost}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.purchaseCost && AssetFormik.errors.purchaseCost}
                />
                </Box>
              </Box>

              <Box sx={{ display:"flex", gap:"15px"}}>
                <Box sx={{ width: "50%" }}>
                  <CustomDatePicker
                    label="Warranty Expiry Date"
                    value={AssetFormik.values.warrantyExpiry}
                    onChange={(value) => AssetFormik.setFieldValue('warrantyExpiry', value)}
                    error={AssetFormik.touched.warrantyExpiry && Boolean(AssetFormik.errors.warrantyExpiry)}
                    helperText={AssetFormik.touched.warrantyExpiry && AssetFormik.errors.warrantyExpiry}
                    required
                  />
               </Box> 
                <Box sx={{ width:"50%"}}>
                <CustomTextField
                  id="location"
                  type="location"
                  name="location"
                  label="Location"
                  placeholder="Location"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.location}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.location && AssetFormik.errors.location}
                />
                </Box>
              </Box>

              <Box sx={{ width:"100%", gap:"15px", display:"flex" }}>
              <Box sx={{ width:"50%"}}>
                <CustomSelect
                  id="status"
                  name="status"
                  label="Status"
                  searchable
                  options={[ 
                    { value:"IN_USE", label:"IN USE" },
                    { value:"IN_REPAIR", label:"IN REPAIR" },
                    { value:"IN_STORAGE", label:"IN STORAGE" },
                    { value:"DISPOSED", label:"DISPOSED" },
                  ]}
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.status}
                  onBlur={AssetFormik.handleBlur}
                  error={AssetFormik.touched.status && Boolean(AssetFormik.errors.status)}
                  helperText={AssetFormik.touched.status && AssetFormik.errors.status}
                />
              
                </Box>
                <Box sx={{ width:"50%"}}>
                  <CustomTextField
                  id="conditionNote"
                  type="text"
                  name="conditionNote"
                  label="Condition Note"
                  placeholder="Condition Note"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.condition}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.condition && AssetFormik.errors.condition}
                />
                </Box>
              </Box>
                  <Box sx={{ width:"100%"}}>
                  <CustomSelect
                  id="assignedTo"
                  name="assignedTo"
                  label="Assigned To"
                  searchable
                  options={usersList?.data?.content?.map((user:User)=>({
                    value:`${user.firstname} ${user.lastname}`,
                    label:`${user.firstname} ${user.lastname}`,
                  }))}
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.assignedTo}
                  onBlur={AssetFormik.handleBlur}
                  error={AssetFormik.touched.assignedTo && Boolean(AssetFormik.errors.assignedTo)}
                  helperText={AssetFormik.touched.assignedTo && AssetFormik.errors.assignedTo}
                />
              </Box>

              <Box sx={{  display: "flex", gap: "15px" }}>
                 <Box sx={{ width: "50%" }}>
                  <CustomDatePicker
                    label="Compliance Expiry Date"
                    value={AssetFormik.values.complianceExpiry}
                    onChange={(value) => AssetFormik.setFieldValue('complianceExpiry', value)}
                    error={AssetFormik.touched.complianceExpiry && Boolean(AssetFormik.errors.complianceExpiry)}
                    helperText={AssetFormik.touched.complianceExpiry && AssetFormik.errors.complianceExpiry}
                  />
               </Box> 
                <Box sx={{ width: "50%" }}>
                  <CustomDatePicker
                    label="Last Inspection Expiry Date"
                    value={AssetFormik.values.lastInspectionDate}
                    onChange={(value) => AssetFormik.setFieldValue('lastInspectionDate', value)}
                    error={AssetFormik.touched.lastInspectionDate && Boolean(AssetFormik.errors.lastInspectionDate)}
                    helperText={AssetFormik.touched.lastInspectionDate && AssetFormik.errors.lastInspectionDate}
                  />
               </Box> 
              </Box>
              <Box sx={{ display:"flex", gap:"15px"}}>
                <Box sx={{ width:"50%"}}>
                  <CustomDatePicker
                    label="Next Inspection Due Date"
                    value={AssetFormik.values.nextInspectionDue}
                    onChange={(value) => AssetFormik.setFieldValue('nextInspectionDue', value)}
                    error={AssetFormik.touched.nextInspectionDue && Boolean(AssetFormik.errors.nextInspectionDue)}
                    helperText={AssetFormik.touched.nextInspectionDue && AssetFormik.errors.nextInspectionDue}
                  />
                </Box>
                <Box sx={{ width:"50%"}}>
                  <CustomTextField
                  id="supportingDocs"
                  type="text"
                  name="supportingDocs"
                  label="Supporting Documents"
                  placeholder="supportingDocs"
                  onChange={AssetFormik.handleChange}
                  value={AssetFormik.values.supportingDocs}
                  onBlur={AssetFormik.handleBlur}
                  errorMessage={AssetFormik.touched.supportingDocs && AssetFormik.errors.supportingDocs}
                />
                </Box>
              </Box>
              <Box sx={{ marginBottom: "20px", marginTop: "10px", gap: "20px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton  loading={AssetFormik.isSubmitting} label={updatingAsset ? "Update Asset" : "Create Asset"}/>
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