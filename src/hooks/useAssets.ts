import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetAssetsParams } from "../types/asset";
import { createAssetService, deleteAssetService, getAllAssetsService, updateAssetService } from "../services/assetService";

export const useGetAssets = (params?: GetAssetsParams) => {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: () => getAllAssetsService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssetService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAssetService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAssetService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};
