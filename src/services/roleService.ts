import type { GetRolesParams, Role, RolesApiResponse, RolesPayload } from "../types/roles";
import { apiClient } from "../utils/apiClient";

export const createRoleService = async (roleData: RolesPayload) => {
  try {
    const response = await apiClient.post(`aims/roles`,roleData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRolesService = async (params?:GetRolesParams): Promise<RolesApiResponse> => {
  try {
    const { page = 1, limit = 10 , search = ""} = params || {}
    const response = await apiClient.get(`aims/roles`,{ params:{page,limit, search: search.trim() || undefined}});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateRoleService = async ({roleCode, ...roleData }:Role ): Promise<Role> => {
  try {
    const response = await apiClient.put(`aims/roles/${roleCode}`, roleData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const deletRoleService = async(roleCode:number)=>{
  try {
    const response = await apiClient.delete(`aims/roles/${roleCode}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
