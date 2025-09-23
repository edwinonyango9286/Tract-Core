export interface CreateAssetPayload {
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: string;
  location: string;
  assignedTo?: string;
}

export interface Asset {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  condition?: string;
  location?: string;
  assignedTo?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAssetsParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetAllAssetsResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: Asset[];
  requestId: number;
  timestamp: Date;
}
