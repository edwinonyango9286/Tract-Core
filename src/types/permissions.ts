export interface PermissionsPayload {
  status?:string;
  permissionName: string;
  permissionDescription: string;
}

export interface Permission {
  id: number;
  permissionName: string;
  permissionDescription: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionsResponse {
  content: Permission[];
  totalElements: number;
}

export interface GetPermissionsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
