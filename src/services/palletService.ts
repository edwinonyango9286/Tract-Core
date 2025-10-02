import type { Pallet, CreatePalletPayload, GetAllPalletsResponse, GetPalletsParams } from "../types/pallet";
import { apiClient } from "../utils/apiClient";


export const createPalletService = async (palletData: CreatePalletPayload) => {
  try {
    const response = await apiClient.post(`aims/pallets`, palletData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getAllPalletsService = async (params?: GetPalletsParams): Promise<GetAllPalletsResponse> => {
  try {
    const { page = 0, size = 10, search = "", status ="" } = params || {};
    let url = `aims/pallets/search?page=${page}&size=${size}&sortBy=lastMoveAt&direction=desc`;
    if (search) {
      url += `&keyword=${encodeURIComponent(search.trim())}`;
    }
    if(status){
      url += `&status=${encodeURIComponent(status)}`
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deletePalletService = async (code: string) => {
  try {
    const response = await apiClient.delete(`aims/pallets/${code}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const updatePalletService = async ({ code, ...palletData }: Pallet) => {
  try {
    const response = await apiClient.put(`aims/pallets/update/${code}`, palletData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
