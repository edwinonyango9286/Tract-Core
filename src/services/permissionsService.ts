import type { GetPermissionsParams, PermissionsPayload, PermissionsResponse } from "../types/permissions";
import { apiClient } from "../utils/apiClient";
import type { Permission } from "../types/permissions";

export const getPermissionsService = async (params?: GetPermissionsParams): Promise<PermissionsResponse> => {
  try {
    const { page = 0, size = 10, search = "", status = "" } = params || {}
    let url=`bursary-hub/permissions/search?page=${page}&size=${size}&sortBy=createdAt&sortDir=DESC`
    if(search){
      url =`bursary-hub/permissions/search?keyword=${encodeURIComponent(search.trim())}&page=${page}&size=${size}&sortBy=createdAt&sortDir=DESC`
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createPermissionService = async (permissionData: PermissionsPayload): Promise<Permission> => {
  try {
    const response = await apiClient.post(`bursary-hub/permissions`, permissionData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updatePermissionService = async ({ id, ...permissionData }:Permission ): Promise<Permission> => {
  try {
    const response = await apiClient.put(`bursary-hub/permissions/${id}`, permissionData);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const deletePermissionService = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`bursary-hub/permissions/${id}`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export interface DeactivatePermissionPayload {
  id?:number;
  status?:string;
}

export const deactivatePermissionService = async (deactivateData:DeactivatePermissionPayload)=>{
  try {
    const response = await apiClient.patch(`bursary-hub/permissions/${deactivateData.id}/status`, deactivateData);
    return response;
  } catch (error) {
    console.log(error);
    throw error
  }
}
