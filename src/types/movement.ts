export interface CreateMovementPayload {
  palletCode: string;
  movementType: string;
  fromLocation: string;
  toLocation: string;
  fromStackCode: string;
  toStackCode: string;
  reference: string;
  notes?: string;
  operatorName?: string;
  returnCondition: string;
}

export interface Movement {
  moveId?: string;
  palletCode?: string;
  movementType?: string;
  fromLocation?: string;
  toLocation?: string;
  fromStackCode?: string;
  toStackCode?: string;
  reference?: string;
  operatorName?: string;
  notes?: string;
  returnCondition?: string;
  moveAt?: string;
}

export interface GetMovementsParams {
  page?: number;
  size?: number;
  search?: string;
  type?: string;
  start?: string;
  end?: string;
}

export interface GetAllMovementsResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    totalElements: number;
    content: Movement[];
  };
  requestId: string;
  timestamp: string;
}
