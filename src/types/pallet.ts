export interface CreatePalletPayload {
  type:string;
  owner:string;
  initialStackCode: string;
  initialLocation: string;
  notes: string;
}

export interface Pallet {
  code?: string;
  type?: string;
  status?: string;
  currentStackCode?: string;
  currentLocation?:string;
  owner?: string;
  lastReference?: string;
  lastMoveAt?: string;
  notes?: string;
}
export interface GetPalletsParams {
  page?: number;
  size?: number;
  search?: string;
  status?:string;
}
export interface GetAllPalletsResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
   data: {
    content: Pallet[];
    totalElements:number;
  }
  requestId: number;
  timestamp: Date;
}
