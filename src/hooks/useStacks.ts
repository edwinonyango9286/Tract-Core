import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetStacksParams } from "../types/stack";
import { createStackService, deleteStackService, getAllStacksService, updateStackService } from "../services/stackService";

export const useGetStacks = (params?: GetStacksParams) => {
  return useQuery({
    queryKey: ["stacks", params],
    queryFn: () => getAllStacksService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStack = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStackService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    },
  });
};

export const useUpdateStack = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStackService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    },
  });
};

export const useDeleteStack = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStackService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    },
  });
};
