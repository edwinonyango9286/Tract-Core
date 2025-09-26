import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetCategoriesParams } from "../types/category";
import { createCategoryService, deleteCategoryService,exportCategoriesService,getAllCategoriesService, getCategoriesKPIService, updateCategoryService, updateCategoryStatusService } from "../services/categoryService";

export const useGetCategories = (params?: GetCategoriesParams) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getAllCategoriesService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey:["categoriesKPI"]})
    },
  });
};
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey:["categoriesKPI"]})
    },
  });
};

export const useUpdateCategoryStatus =()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:updateCategoryStatusService,
    onSuccess:()=>{
      queryClient.invalidateQueries({ queryKey:["categories"]});
      queryClient.invalidateQueries({ queryKey:["categoriesKPI"]})
    }
  })
}

export const useDeleteCategory= () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey:["categoriesKPI"]})
    },
  });
};


export const useGetCatgoriesKPI =()=>{
   return useQuery({
    queryKey: ["categoriesKPI"],
    queryFn:getCategoriesKPIService,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

export const useExportCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exportCategoriesService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
