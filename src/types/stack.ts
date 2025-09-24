export interface CreateStackPayload {
  warehouse: string;
  zone: string;
  capacity: number;
  description: string;
}
export interface Stack {
  code?: string;
  warehouse?: string;
  zone?: string;
  capacity?: number;
  description?: string;
}
export interface GetStacksParams {
  page?: number;
  size?: number;
  search?: string;
}
export interface GetAllStacksResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: Stack[];
  requestId: number;
  timestamp: Date;
}

