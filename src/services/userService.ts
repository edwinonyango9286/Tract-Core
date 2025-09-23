import type { User, CreateUserPayload, GetAllUsersResponse, GetUsersParams } from "../types/user";
import { apiClient } from "../utils/apiClient";


export const createUserService = async (userData: CreateUserPayload) => {
  try {
    const response = await apiClient.post(`aims/users`, userData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getAllUsersService = async (params?: GetUsersParams): Promise<GetAllUsersResponse> => {
  try {
    const { page = 0, size = 10, search = "" } = params || {};
    let url = `aims/users?page=${page}&size=${size}`;
    if (search) {
      url = `/aims/users/search?q=${search}&page=${page}&size=${size}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUserService = async (id: number) => {
  try {
    const response = await apiClient.delete(`aims/users/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const updateUserService = async ({ id, ...userData }: User) => {
  try {
    const response = await apiClient.put(`aims/users/${code}`, userData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
