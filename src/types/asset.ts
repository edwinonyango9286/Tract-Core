export interface CreateAssetPayload {
  name: string;
  categoryCode:string;
  subCategory?: string;
  model:string;
  manufacturer:string;
  supplier:string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry:string;
  status:string;
  conditionNote:string;
  complianceExpiry:string;
  lastInspectionDate:string;
  nextInspectionDue:string;
  condition: string;
  location: string;
  assignedTo?: string;
  supportingDocs?:string;
}



 "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    "categoryName": "string",
    "categoryCode": "string",
    "subCategory": "string",
    "model": "string",
    "serialNumber": "string",
    "manufacturer": "string",
    "supplier": "string",
    "assignedTo": "string",
    "location": "string",
    "conditionNote": "string",
    "documentsUrl": "string",
    "purchaseDate": "2025-09-23",
    "warrantyExpiry": "2025-09-23",
    "complianceExpiry": "2025-09-23",
    "lastInspectionDate": "2025-09-23",
    "nextInspectionDue": "2025-09-23",
    "purchaseCost": 0,
    "createdAt": "2025-09-23T07:58:08.482Z",
    "updatedAt": "2025-09-23T07:58:08.482Z",
    "status": "IN_USE"
  },


export interface Asset {
  id?: string;
  code?: string;
  name?: string;
  categoryName?: string;
  categoryCode?:string;
  subCategory?: string;
  model?:string;
  serialNumber?: string;
  manufacturer?:string;
  supplier?:string;
  purchaseDate?: string;
  purchaseCost?: number;
  condition?: string;
  location?: string;
  assignedTo?: string;
  conditionNote?:string;
  documentsUrl?:string;
  status?: string;
  warrantyExpiry?:string;
  complianceExpiry?:string;
  lastInspectionDate?:string;
  nextInspectionDue?:string;
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
