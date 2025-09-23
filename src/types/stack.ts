export interface CreateStackPayload {
  name: string;
  description: string;
  type: string;
  height: number;
  maxCapacity: number;
  currentLoad: number;
  location: string;
  status: string;
  palletId?: string;
  zone?: string;
}

export interface Stack {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  type?: string;
  height?: number;
  maxCapacity?: number;
  currentLoad?: number;
  location?: string;
  status?: string;
  palletId?: string;
  zone?: string;
  createdAt?: string;
  updatedAt?: string;
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
