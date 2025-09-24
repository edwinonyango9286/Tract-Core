import type { Stack, CreateStackPayload, GetAllStacksResponse, GetStacksParams } from "../types/stack";
import { apiClient } from "../utils/apiClient";


export const createStackService = async (stackData: CreateStackPayload) => {
  try {
    const response = await apiClient.post(`/aims/stacks`, stackData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getAllStacksService = async (params?: GetStacksParams): Promise<GetAllStacksResponse> => {
  try {
    const { page = 0, size = 10, search = "" } = params || {};
    let url = `/aims/stacks`;
    if (search) {
      url = `/aims/stacks`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteStackService = async (code: string) => {
  try {
    const response = await apiClient.delete(`aims/stacks/${code}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const updateStackService = async ({ code, ...stackData }: Stack) => {
  try {
    const response = await apiClient.put(`aims/stacks/${code}`, stackData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
