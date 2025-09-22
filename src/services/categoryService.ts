import type { CreateCategoryPayload, GetAllCategoriesResponse } from "../types/category";
import { apiClient } from "../utils/apiClient";


export const createCategoryService = async (categoryData:CreateCategoryPayload) => {
  try {
    const response = await apiClient.post(`aims/categories`,categoryData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllCategoriesService = async ():Promise<GetAllCategoriesResponse>=>{
    try {
        const response = await apiClient.get(``);
        return response.data;
    } catch (error) {
       console.log(error);
       throw error; 
    }
}
