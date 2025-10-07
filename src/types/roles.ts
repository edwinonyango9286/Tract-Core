import type { Permission } from "./permissions";

export interface RolesPayload {
  name: string;
  shortDesc: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  permissions: number[];
}

export interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Role {
  roleCode: number;
  roleName: string;
  roleShortDesc: string;
  roleDescription: string;
  roleStatus: "ACTIVE" | "INACTIVE";
  createDate: string;
  lastModified: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  permissions: Permission[];
  version: number;
}

export interface RolesApiResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: Role[];
  timestamp: string;
  requestId: string | null;
}


export interface GetRolesKPIResponse {
  data:{
  totalRoles: number;
  activeCount: number;
  inactiveCount: number;
  deletedCount: number;
  }
}
