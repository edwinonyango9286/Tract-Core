import type { Category, CreateCategoryPayload, GetAllCategoriesResponse, GetCategoriesParams } from "../types/category";
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


export const getAllCategoriesService = async (params?:GetCategoriesParams):Promise<GetAllCategoriesResponse>=>{
    try {
       const {page = 0, size= 10 ,search=""} = params || {};
       let url =`aims/categories?page=${page}&size=${size}`;
        if(search){
          url = `/aims/categories/search?q=${search}&page=${page}&size=${size}`
        }
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
       console.log(error);
       throw error; 
    }
}

export const deleteCategoryService =  async (code:string)=>{
  try {
    const response = await apiClient(`aims/categories/${code}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export const updateCategoryService  = async ({code, ...categoryData}:Category)=>{
  try {
    const response = await apiClient.put(`aims/categories/${code}`, categoryData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
