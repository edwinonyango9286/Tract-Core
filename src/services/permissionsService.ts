import type { GetPermissionsParams, PermissionsPayload, PermissionsResponse } from "../types/permissions";
import { apiClient } from "../utils/apiClient";
import type { Permission } from "../types/permissions";

export const getPermissionsService = async (params?: GetPermissionsParams): Promise<PermissionsResponse> => {
  try {
    const { page = 1, limit = 10, search = "" } = params || {}
    const response = await apiClient.get(`bursary-hub/permissions`, {params: {page,limit, search: search.trim() || undefined}});
    console.log(response.data,"permissionsresponse,.............")
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
