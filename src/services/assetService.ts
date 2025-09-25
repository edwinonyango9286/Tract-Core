import type { Asset, AssignAssetToUserPayload, CreateAssetPayload, GetAllAssetsResponse, GetAssetKPIResponse, GetAssetsParams } from "../types/asset";
import { apiClient } from "../utils/apiClient";


export const createAssetService = async (assetData: CreateAssetPayload) => {
  try {
    const response = await apiClient.post(`aims/assets/create`, assetData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllAssetsService = async (params?: GetAssetsParams): Promise<GetAllAssetsResponse> => {
  try {
    const { page = 0, size = 10, search = "" } = params || {};
    let url = `aims/assets/search?page=${page}&size=${size}&sortBy=createdAt&direction=desc`;
    if (search) {
      url=`aims/assets/search?keyword=${encodeURIComponent(search.trim())}&page=${page}&size=${size}&sortBy=createdAt&direction=desc`
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteAssetService = async (code: string) => {
  try {
    const response = await apiClient.delete(`aims/assets/delete/${code}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const updateAssetService = async ({ code, ...assetData }: Asset) => {
  try {
    const response = await apiClient.put(`aims/assets/${code}`, assetData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAssetKPIService = async():Promise<GetAssetKPIResponse>=>{
  try {
    const response = await apiClient.get(`/aims/kpis/assets`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const exportAssetService = async (): Promise<Blob> => {
    try {
        const response = await apiClient.get(`aims/assets/export?sortBy=createdAt&direction=desc`, {
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


export const assignAssetToUserService =  async (assignData:AssignAssetToUserPayload)=>{
  try {
    const response = await apiClient.patch(`aims/assets/${assignData.code}/assign?assignedTo=${assignData.assignedTo}&location=${assignData.location}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
