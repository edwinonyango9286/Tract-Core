import type { CreateSubCategoryPayload, GetSubCategoriesParams, GetSubCategoriesResponse } from "../types/subCategory";
import { apiClient } from "../utils/apiClient";

export const getSubCategoriesService = async (params?:GetSubCategoriesParams):Promise<GetSubCategoriesResponse>=>{
    try {
        const { page = 0,size = 10,search=""} = params || {}
        let url = `aims/subcategories/search?page=${page}&size=${size}&sort=createdAt%2CDESC`
        if(search){
            url = `aims/subcategories/search?keyword=${search}&page=${page}&size=${size}&sort=createdAt%2CDESC`
        }
        const response = await apiClient.get(url);
        return response;
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