export interface CreateMovementPayload {
  type: string;
  itemId: string;
  itemType: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  reason: string;
  performedBy: string;
  notes?: string;
  priority: string;
}

export interface Movement {
  id?: string;
  code?: string;
  type?: string;
  itemId?: string;
  itemType?: string;
  fromLocation?: string;
  toLocation?: string;
  quantity?: number;
  reason?: string;
  performedBy?: string;
  notes?: string;
  priority?: string;
  status?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMovementsParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetAllMovementsResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: Movement[];
  requestId: number;
  timestamp: Date;
}
