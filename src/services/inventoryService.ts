import type { inventoryKPIResponse } from "../types/inventory";
import { apiClient } from "../utils/apiClient";

export const getInventoryKPI = async():Promise<inventoryKPIResponse>=>{
    try {
        const response = await apiClient.get(`/aims/kpis/inventory?windowDays=30&overdueDays=14`);
        return response.data;
    } catch (error) {
      console.log(error);
      throw error;  
    }
}