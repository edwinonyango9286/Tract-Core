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
import { useCreateCategory, useDeleteCategory, useGetCategories, useUpdateCategory } from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import type { GridPaginationModel } from "@mui/x-data-grid";
import type { Category, CreateCategoryPayload, GetAllCategoriesResponse } from "../../types/category";
import { useFormik } from "formik";
import * as Yup from "yup";
import { dateFormatter } from "../../utils/dateFormatter";

const breadcrumbs = [
  <Typography key={1} style={{ cursor: "pointer", color: "#707070", fontSize: "14px" }}>
    Dashboard
  </Typography>,
  <Typography key={2} style={{ cursor: "pointer", color: "#dc3545", fontSize: "14px" }}>
    Categories
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
  
  const CategorySchema = Yup.object<CreateCategoryPayload>({
    name:Yup.string().required("Please provide category name."),
    description:Yup.string().required("Please provide category description"),
  })

const Categories = ()=>{
  const navigate = useNavigate();
  const {showSnackbar} = useSnackbar();
  const deleteCategoryMutation =  useDeleteCategory();
  const [paginationModel,setPaginationModel] = useState({ page:0, pageSize:10 });
  const [searchTerm,setSearchTerm]= useState<string>("")
  const debouncedSearchTerm = useDebounce(searchTerm,500)
  const isDeleting = deleteCategoryMutation.isPending;
  const {data:categoriesList,isLoading} = useGetCategories({ page:paginationModel.page, size:paginationModel.pageSize, search:debouncedSearchTerm} )
  const createCategoryMutation= useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const [categoryData,setCategoryData] = useState<Category | null>(null)

    const { rows, rowCount } = useMemo(() => {
      if (!categoriesList) {
        return { rows: [], rowCount: 0 };
      }
      const response = categoriesList as unknown as GetAllCategoriesResponse;
      return { 
        rows: response.data || [], 
        rowCount: response.data.length || 0 
      };
    }, [categoriesList]);


  const handleSearchChange = useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
    setSearchTerm(e.target.value);
    setPaginationModel((prev)=>({...prev,page:0}))
  },[])

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
  }, []);

  const [openDeleteModal,setOpenDeleteModal] = useState<boolean>(false);
  const [selectedCategoryId,setSelectedCategoryId] = useState<string>("");
  const [categoryName,setCategoryName] =useState<string>("");


  const handleOpenDeleteModal = (categoryId:string)=>{
    setOpenDeleteModal(true);
    setSelectedCategoryId(categoryId);
  }

  const handleCloseDeleteModal = ()=>{
    setOpenDeleteModal(false);
    setSelectedCategoryId("");
    setCategoryName("");
  }
  const [open, setOpen] = useState(false);

  const handleDeleteCategory = useCallback(async()=>{
    if(selectedCategoryId){
      try {
       await deleteCategoryMutation.mutateAsync(selectedCategoryId);
       showSnackbar("Category deleted successfully.", "success");
       handleCloseDeleteModal();
    } catch (error) {
      const err = error as AxiosError<{message?:string}>;
      showSnackbar(err.response?.data.message || err.message )
    }
    }
  },[selectedCategoryId,showSnackbar, deleteCategoryMutation])

  const [updatingCategory,setUpdatingCategory] = useState<boolean>(false)
   const CategoryFormik = useFormik<CreateCategoryPayload>({
      initialValues: {
        name: categoryData?.name || "",
        description: categoryData?.description || "",
      },
      validationSchema: CategorySchema,
      enableReinitialize: true, 
      onSubmit: async (values, { setSubmitting, resetForm }) => {
        try {
          if (updatingCategory && categoryData) {
            await updateCategoryMutation.mutateAsync({ code: categoryData.code, ...values });
            showSnackbar("Category updated successfully.", "success");
          } else {
            await createCategoryMutation.mutateAsync(values);
            showSnackbar("Category created successfully.", "success");
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
        setUpdatingCategory(false);
        setCategoryData(null);
      }, []);
    
      const handleClose = useCallback(() => {
        setOpen(false);
        CategoryFormik.resetForm();
        setUpdatingCategory(false);
        setCategoryData(null);
      }, [CategoryFormik]);
    
      const handleEdit = useCallback((category: Category) => {
        setCategoryData(category);
        setUpdatingCategory(true);
        setOpen(true);
      }, []);


      
  const columns: GridColDef[] = useMemo(() => [
    { field: 'code', headerName: 'Code', flex:1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1,
      renderCell:(params)=>dateFormatter(params.value)
    },
    { field: 'updatedAt', headerName: 'Updated At', flex: 1,
      renderCell:(params)=>dateFormatter(params.value)
    },
    {
      field: 'action', headerName: 'Action', flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <IconButton onClick={() => handleEdit(params.row as Category)}>
              <img src={editIcon} alt="editIcon" style={{ width: "21px", height: "21px" }} />
            </IconButton>
            <IconButton onClick={()=>{handleOpenDeleteModal(params?.row?.code); setCategoryName(params?.row?.name)}}>
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
          <Typography sx={{ fontSize: "25px", fontWeight: "600", color: "#032541" }}>Categories</Typography>
        </Box>
        <CustomAddButton variant="contained" label="Add Category" onClick={handleOpen} />
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
          <form style={{ width: "100%" }} onSubmit={CategoryFormik.handleSubmit}>
            <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>
              {updatingCategory ? "Update Category Details" : "Add Category"}
            </Typography>
            <Box sx={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <CustomTextField
                id="name"
                name="name"
                label="Name"
                type="text"
                placeholder="Name"
                onChange={CategoryFormik.handleChange}
                value={CategoryFormik.values.name}
                onBlur={CategoryFormik.handleBlur}
                errorMessage={CategoryFormik.touched.name && CategoryFormik.errors.name}
              />
              <CustomTextField
                id="description"
                type="text"
                name="description"
                label="Description"
                placeholder="Description"
                onChange={CategoryFormik.handleChange}
                value={CategoryFormik.values.description}
                onBlur={CategoryFormik.handleBlur}
                errorMessage={CategoryFormik.touched.description && CategoryFormik.errors.description}
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
                  loading={CategoryFormik.isSubmitting}
                  label={updatingCategory ? "Update Category" : "Create Category"}
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
      itemT0Delete={`${categoryName} category`}
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

export default Categories

// https://asset-inventory-management-production.up.railway.app/api/v1/aims/categories?page=0&size=20
// https://asset-inventory-management-production.up.railway.app/api/v1/aims/categories?page=1&size=10

