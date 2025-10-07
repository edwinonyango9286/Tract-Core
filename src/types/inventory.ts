export interface inventoryKPIResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    totals: {
      totalPallets: number;
      inStack: number;
      outbound: number;
      returned: number;
      inRepair: number;
      quarantine: number;
      scrap: number;
      inStackRate: number;
      outboundRate: number;
      returnRate: number;
    };
    stackUtilization: {
      stackCode: string;
      capacity: number;
      used: number;
      utilization: number;
    }[];
    flow: {
      windowDays: number;
      dispatchCount: number;
      returnCount: number;
      avgDispatchToReturnDays: number;
    };
    risk?: {
      overdueDays?: number;
      lostPallets?: number;
    };
    timestamp: string;
    requestId: string;
  };
}
