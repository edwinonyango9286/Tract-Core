import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetMovementsParams } from "../types/movement";
import { createMovementService, deleteMovementService, getAllMovementsService, updateMovementService } from "../services/movementService";

export const useGetMovements = (params?: GetMovementsParams) => {
  return useQuery({
    queryKey: ["movements", params],
    queryFn: () => getAllMovementsService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMovementService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
    },
  });
};

export const useUpdateMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMovementService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
    },
  });
};

export const useDeleteMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMovementService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
    },
  });
};
