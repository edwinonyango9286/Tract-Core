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
    const { page = 0, size = 10, search = "" } = params || {};
    let url = `aims/movements?page=${page}&size=${size}`;
    if (search) {
      url = `/aims/movements/search?q=${search}&page=${page}&size=${size}`;
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


export const updateMovementService = async ({ code, ...movementData }: Movement) => {
  try {
    const response = await apiClient.put(`aims/movements/${code}`, movementData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
