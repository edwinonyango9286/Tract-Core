import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetPalletsParams } from "../types/pallet";
import { createPalletService, deletePalletService, getAllPalletsService, updatePalletService } from "../services/palletService";

export const useGetPallets = (params?: GetPalletsParams) => {
  return useQuery({
    queryKey: ["pallets", params],
    queryFn: () => getAllPalletsService(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPalletService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pallets"] });
    },
  });
};

export const useUpdatePallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePalletService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pallets"] });
    },
  });
};

export const useDeletePallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePalletService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pallets"] });
    },
  });
};
