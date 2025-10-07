export interface CreateAssetPayload {
  name: string;
  categoryCode: string;
  subCategory?: string;
  model: string;
  manufacturer: string;
  supplier: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
  status: string;
  conditionNote: string;
  complianceExpiry: string;
  lastInspectionDate: string;
  nextInspectionDue: string;
  location: string;
  assignedTo?: string;
  supportingDocs?: string;
}

export interface Asset {
  id?: string;
  code?: string;
  name?: string;
  categoryName?: string;
  categoryCode?: string;
  subCategory?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  supplier?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  condition?: string;
  location?: string;
  assignedTo?: string;
  conditionNote?: string;
  documentsUrl?: string;
  status?: string;
  warrantyExpiry?: string;
  complianceExpiry?: string;
  lastInspectionDate?: string;
  nextInspectionDue?: string;
  supportingDocs?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface GetAssetsParams {
  page?: number;
  size?: number;
  search?: string;
  status?:string;
  startDate?:string;
  endDate?:string;

}
export interface GetAllAssetsResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    content: Asset[];
    totalElements: number;
  };
  requestId: number;
  timestamp: Date;
}

export interface GetAssetKPIResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    [categoryName: string]: number;
  };
  timestamp: string;
  requestId: string | null;
}

export interface AssignAssetToUserPayload {
  code?: string;
  assignedTo?: string;
  location?: string;
}
