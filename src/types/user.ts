export interface CreateUserPayload {
  firstName:string;
  lastName: string;
  email: string;
  idNo?:number;
  phone?:string;
  role?:number;
}
export interface User {
  id: number;
  firstname:string;
  lastname:string;
  email:string;
  userPhoneNumber:string;
  userIdNumber?:number;
  phoneVerified: boolean;
  roleDescription?:string;
}

export interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetAllUsersResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    content: User[];
    totalElements:number
  }
  timestamp: string;
  requestId: string | null;
}


     
