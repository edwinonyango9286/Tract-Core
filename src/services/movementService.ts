import type { Movement, CreateMovementPayload, GetAllMovementsResponse, GetMovementsParams } from "../types/movement";
import { apiClient } from "../utils/apiClient";


export const createMovementService = async (movementData: CreateMovementPayload) => {
  try {
    const response = await apiClient.post(`aims/movements`, movementData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getAllMovementsService = async (params?: GetMovementsParams): Promise<GetAllMovementsResponse> => {
  try {
    const { page = 0, size = 10, search = "", type = "" } = params || {};
    let url = `/aims/movements/search?page=${page}&size=${size}&sortBy=moveAt&direction=desc`;
    if (search) {
      url += `&keyword=${encodeURIComponent(search.trim())}`;
    }
    if(type){
      url+= `&type=${encodeURIComponent(type)}`
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteMovementService = async (code: string) => {
  try {
    const response = await apiClient.delete(`aims/movements/${code}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const updateMovementService = async ({ moveId, ...movementData }: Movement) => {
  try {
    const response = await apiClient.put(`aims/movements/${moveId}`, movementData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const exportMovementsService = async (): Promise<Blob> => {
    try {
        const response = await apiClient.get(`aims/movements/export?sortBy=moveAt&direction=desc'`, {
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
