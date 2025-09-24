import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPermissionService, deactivatePermissionService, deletePermissionService, getPermissionsService, updatePermissionService } from "../services/permissionsService";
import type { GetPermissionsParams } from "../types/permissions";

export const usePermissions = (params?: GetPermissionsParams) => {
  return useQuery({
    queryKey: ["permissions", params], 
    queryFn: () => getPermissionsService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPermissionService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePermissionService,
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePermissionService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });    
    },
  });
};

export const useDeactivatePermission = ()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivatePermissionService,
    onSuccess :()=>{
      queryClient.invalidateQueries({ queryKey: ["permissions"]})
    }
  })
}


