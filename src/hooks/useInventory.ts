import { useQuery } from "@tanstack/react-query";
import { getInventoryKPI } from "../services/inventoryService";

export const useGetInventoryKPI = () => {
  return useQuery({
    queryKey: ["inventory-KPI"],
    queryFn: getInventoryKPI,
  });
};
