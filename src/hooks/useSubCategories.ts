import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSubCategoryService, deleteSubCategoryService, getSubCategoriesService, updateSubCategoryService } from "../services/subCategoryService";
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
