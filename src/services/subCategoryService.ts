import type { CreateSubCategoryPayload, DeactivateSubCategoryPayload, GetSubCategoriesParams, GetSubCategoriesResponse, SubCategoryKPI } from "../types/subCategory";
import { apiClient } from "../utils/apiClient";

export const getSubCategoriesService = async (params?:GetSubCategoriesParams):Promise<GetSubCategoriesResponse>=>{
    try {
        const { page = 0,size = 10,search=""} = params || {}
        let url = `aims/subcategories/search?page=${page}&size=${size}&sort=createdAt%2CDESC`
        if(search){
            url = `aims/subcategories/search?keyword=${search}&page=${page}&size=${size}&sort=createdAt%2CDESC`
        }
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
      console.log(error);
      throw error  
    }
}


export const createSubCategoryService = async(subCategoryData:CreateSubCategoryPayload)=>{
    try {
        const response = await apiClient.post(`aims/subcategories/create`,subCategoryData);
        return response;
    } catch (error) {
      console.log(error);
      throw error;  
    }
}

export const updateSubCategoryService = async(subCategoryData:CreateSubCategoryPayload)=>{
    try {
        const response = await apiClient.put(`aims/subcategories/update`,subCategoryData);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const  deleteSubCategoryService = async(subCategoryCode:string)=>{
    try {
        const response = await apiClient.delete(`aims/subcategories/delete/${subCategoryCode}`);
        return response
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const changeSubCategoryStatusService = async (subCategoryData:DeactivateSubCategoryPayload) => {
    try {
        const response = await apiClient.put(`aims/subcategories/update`, subCategoryData);
        return response;
    } catch (error) {
     console.log(error);
     throw error   
    }
}

export const getSubCategoriesKPIService = async():Promise<SubCategoryKPI> =>{
    try {
        const response = await apiClient.get(`aims/subcategories/kpi`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const exportSubCategoriesService = async (): Promise<Blob> => {
    try {
        const response = await apiClient.get(`aims/subcategories/export`, {
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



