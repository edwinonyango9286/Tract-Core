import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetAssetsParams } from "../types/asset";
import { assignAssetToUserService, createAssetService, deleteAssetService, exportAssetService, getAllAssetsService, getAssetKPIService, updateAssetService } from "../services/assetService";

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
      queryClient.invalidateQueries({ queryKey: ["assets"]});
      queryClient.invalidateQueries({ queryKey:["asset-kpi"]})
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAssetService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"]});
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

export const useGetAssetKPI = () => {
  return useQuery({
    queryKey:["asset-kpi"],
    queryFn: getAssetKPIService,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  }) 
}

export const useExportAssets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exportAssetService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useAssignAssetToUser = ()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:assignAssetToUserService,
    onSuccess:()=>{
      queryClient.invalidateQueries({ queryKey:["assets"]});
    }
  })
}
