import type { CategoriesKPIResponse, Category, CreateCategoryPayload, GetAllCategoriesResponse, GetCategoriesParams } from "../types/category";
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
       const {page = 0, size= 10 ,search="" ,categoryStatus ="" ,startDate="",endDate = "" } = params || {};
       let url =`aims/categories/global-search?page=${page}&size=${size}&sort=createdAt%2CDESC`;
        if(search){
          url += `&keyword=${encodeURIComponent(search.trim())}`;
        }
        if(categoryStatus){
          url += `&categoryStatus=${encodeURIComponent(categoryStatus)}`
        }
        if(startDate){
          url+= `&startDate=${encodeURIComponent(startDate)}`
        }
        if(endDate){
          url += `&endDate=${encodeURIComponent(endDate)}`;
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

export const updateCategoryStatusService = async(categoryData:Category)=>{
  try {
    const response = await apiClient.patch(`/aims/categories/${categoryData.code}/status?status=${categoryData.status}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getCategoriesKPIService = async():Promise<CategoriesKPIResponse>=>{
  try {
    const response = await apiClient.get(`aims/categories/kpi`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const exportCategoriesService = async (): Promise<Blob> => {
    try {
        const response = await apiClient.get(`aims/categories/export`, {
            headers: {
                'Accept': 'text/csv', 
                'Content-Type': 'text/csv',
            },
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
