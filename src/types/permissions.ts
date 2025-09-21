export interface PermissionsPayload {
  permissionName: string;
  permissionDescription: string;
}


export interface Permission {
  id: number;
  permissionName: string;
  permissionDescription: string;
}

export interface PermissionsResponse {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
}

 export interface GetPermissionsParams {
  page?: number;
  limit?: number;
  search?: string;
}
