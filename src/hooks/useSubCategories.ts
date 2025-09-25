import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeSubCategoryStatusService, createSubCategoryService, deleteSubCategoryService, exportSubCategoriesService, getSubCategoriesKPIService, getSubCategoriesService, updateSubCategoryService } from "../services/subCategoryService";
import type { GetSubCategoriesParams } from "../types/subCategory";

export const useGetSubCategories = (params?: GetSubCategoriesParams) => {
  return useQuery({
    queryKey: ["subCategories", params],
    queryFn: () => getSubCategoriesService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] });
    },
  });
};

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] });
    },
  });
};

export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSubCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] });
    },
  });
};
 
export const useChangeSubCategoryStatus  = ()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeSubCategoryStatusService,
    onSuccess:()=>{
      queryClient.invalidateQueries({ queryKey:["subCategories"]})
      queryClient.invalidateQueries({queryKey:["subcategory-kpi"]})
    }
  })
} 

export const useGetSubCategoryKPI  =()=>{
  return useQuery({
    queryKey: ["subcategory-kpi"],
    queryFn: getSubCategoriesKPIService,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  })
}

export const useExportSubCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exportSubCategoriesService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] });
    },
  });
};
