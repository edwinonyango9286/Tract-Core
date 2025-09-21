import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRolesService, createRoleService, updateRoleService } from "../services/roleService";
import type { GetRolesParams } from "../types/roles";

export const useRoles = (params:GetRolesParams) => {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => getRolesService(params),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoleService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoleService,
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
