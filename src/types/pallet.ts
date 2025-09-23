export interface CreatePalletPayload {
  name: string;
  description: string;
  type: string;
  dimensions: string;
  weight: number;
  capacity: number;
  material: string;
  condition: string;
  location: string;
  status: string;
  supplier?: string;
}

export interface Pallet {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  type?: string;
  dimensions?: string;
  weight?: number;
  capacity?: number;
  material?: string;
  condition?: string;
  location?: string;
  status?: string;
  supplier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetPalletsParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetAllPalletsResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: Pallet[];
  requestId: number;
  timestamp: Date;
}
