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
import { useGetCategories } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { CreateSubCategoryPayload, GetSubCategoriesResponse, SubCategory } from "../../types/subCategory";
import CustomSelect from "../../Components/common/CustomSelect";
import type { Category } from "../../types/category";
import { useCreateSubCategory, useDeleteSubCategory, useGetSubCategories, useUpdateSubCategory } from "../../hooks/useSubCategories";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Sub-Category
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
    borderRadius: "8px"
  };

  const SubCategorySchema = Yup.object<CreateSubCategoryPayload>({
    name:Yup.string().required("Please provide sub category name."),
    description:Yup.string().required("Please provide sub category description."),
    categoryCode:Yup.string().required("Please select category."),
    status:  Yup.string().oneOf(["ACTIVE","INACTIVE"]).required("Please select sub category status.")
  })

const SubCategory = ()=>{
  const navigate = useNavigate();
  const {showSnackbar} = useSnackbar();
  const deleteSubCategoryMutation =  useDeleteSubCategory();
  const [paginationModel,setPaginationModel] = useState({ page:0, pageSize:10 });
  const [searchTerm,setSearchTerm]= useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm,500)
  const isDeleting = deleteSubCategoryMutation.isPending;
  const {data:categoriesList } = useGetCategories()
  const {data:subCategoriesList, isLoading} = useGetSubCategories({ page:paginationModel.page, size:paginationModel.pageSize, search:debouncedSearchTerm })
  const createSubCategoryMutation= useCreateSubCategory();
  const updateSubCategoryMutation = useUpdateSubCategory();
  const [subCategoryData,setSubCategoryData] = useState<SubCategory | null>(null);


    const { rows, rowCount } = useMemo(() => {
      if (!subCategoriesList) {
        return { rows: [], rowCount: 0 };
      }
      const response = subCategoriesList as unknown as GetSubCategoriesResponse;
      return { 
        rows: response.data.content || [], 
        rowCount: response.data.totalElements || 0 
      };
    }, [subCategoriesList]);


  const handleSearchChange = useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
    setSearchTerm(e.target.value);
    setPaginationModel((prev)=>({...prev,page:0}))
  },[])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
  }, []);

  const [openDeleteModal,setOpenDeleteModal] = useState<boolean>(false);
  const [selectedCategoryId,setSelectedCategoryId] = useState<string>("");
  const [subCategoryName,setSubCategoryName] =useState<string>("");


  const handleOpenDeleteModal = (categoryId:string)=>{
    setOpenDeleteModal(true);
    setSelectedCategoryId(categoryId);
  }

  const handleCloseDeleteModal = ()=>{
    setOpenDeleteModal(false);
    setSelectedCategoryId("");
    setSubCategoryName("");
  }
  const [open, setOpen] = useState(false);
  const handleDeleteCategory = useCallback(async()=>{
    if(selectedCategoryId){
      try {
       await deleteSubCategoryMutation.mutateAsync(selectedCategoryId);
       showSnackbar("Category deleted successfully.", "success");
       handleCloseDeleteModal();
    } catch (error) {
      const err = error as AxiosError<{message?:string}>;
      showSnackbar(err.response?.data.message || err.message )
    }
    }
  },[selectedCategoryId,showSnackbar, deleteSubCategoryMutation])


  const [updatingSubCategory,setUpdatingSubCategory] = useState<boolean>(false)
   const SubCategoryFormik = useFormik<CreateSubCategoryPayload>({
      initialValues: {
        name: subCategoryData?.name || "",
        description: subCategoryData?.description || "",
        categoryCode:subCategoryData?.categoryCode || "",
        status:subCategoryData?.status || "ACTIVE"
      },
      validationSchema: SubCategorySchema,
      enableReinitialize: true, 
      onSubmit: async (values, { setSubmitting, resetForm }) => {
        try {
          if (updatingSubCategory && subCategoryData) {
            await updateSubCategoryMutation.mutateAsync(values);
            showSnackbar("Sub category updated successfully.", "success");
          } else {
            await createSubCategoryMutation.mutateAsync(values);
            showSnackbar("Sub category created successfully.", "success");
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
        setUpdatingSubCategory(false);
        setSubCategoryData(null);
      }, []);
    
      const handleClose = useCallback(() => {
        setOpen(false);
        SubCategoryFormik.resetForm();
        setUpdatingSubCategory(false);
        setSubCategoryData(null);
      }, [SubCategoryFormik]);
    
      const handleEdit = useCallback((subCategory: SubCategory) => {
        setSubCategoryData(subCategory);
        setUpdatingSubCategory(true);
        setOpen(true);
      }, []);


  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', flex:1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'categoryName', headerName: 'Category', flex: 1 },
    { field:"status", headerName:"status", flex:1},
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as SubCategory)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={()=>{handleOpenDeleteModal(params?.row?.code); setSubCategoryName(params?.row?.name)}}>
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
    <Box sx={{ width:"100%",height:"100vh"}}>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ width: "100%", alignItems: "center", display: "flex" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Sub Categories</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Sub category" onClick={handleOpen} />
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
          placeholder="Search category..."
        />
      </Box>
      {/* category modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <form style={{ width: "100%" }} onSubmit={SubCategoryFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingSubCategory ? "Update Sub Category Details" : "Add Sub Category"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <CustomTextField
                id="name"
                name="name"
                label="Name"
                type="text"
                placeholder="Name"
                onChange={SubCategoryFormik.handleChange}
                value={SubCategoryFormik.values.name}
                onBlur={SubCategoryFormik.handleBlur}
                errorMessage={SubCategoryFormik.touched.name && SubCategoryFormik.errors.name}
              />
              <CustomTextField
                id="description"
                type="text"
                name="description"
                label="Description"
                placeholder="Description"
                onChange={SubCategoryFormik.handleChange}
                value={SubCategoryFormik.values.description}
                onBlur={SubCategoryFormik.handleBlur}
                errorMessage={SubCategoryFormik.touched.description && SubCategoryFormik.errors.description}
              />

             <CustomSelect
                label="Category"
                name="categoryCode"
                id="categoryCode"
                value={SubCategoryFormik.values.categoryCode}
                onChange={SubCategoryFormik.handleChange}
                onBlur={SubCategoryFormik.handleBlur}
                options={categoriesList?.data.map((category:Category) => ({
                  value: category.code, 
                  label: category.name   
                })) || []} 
                searchable
                error={SubCategoryFormik.touched.categoryCode && Boolean(SubCategoryFormik.errors.categoryCode)}
                helperText={SubCategoryFormik.touched.categoryCode && SubCategoryFormik.errors.categoryCode}
              />

              <Box sx={{
                marginBottom: "20px",
                marginTop:"10px",
                gap: "20px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <CustomCancelButton onClick={handleClose} label="Cancel" />
                <CustomSubmitButton
                  loading={SubCategoryFormik.isSubmitting}
                  label={updatingSubCategory ? "Update Sub Category" : "Create Sub Category"}
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
      title={"Delete Category"} 
      onConfirm={handleDeleteCategory} 
      itemT0Delete={`${subCategoryName} category`}
      />

        <Box sx={{ width: "100%", height: "70vh", marginTop: "20px" }}>
        <CustomDataGrid
          loading={isLoading}
          rows={rows}
          rowCount={rowCount}
          getRowId={(row)=>row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          columns={columns}
        />
      </Box>
    </Box>
  )
}

export default SubCategory





