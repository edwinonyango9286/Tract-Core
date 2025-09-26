export interface CreateCategoryPayload {
  name: string;
  description: string;
}
export interface Category {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  status?:string;
}
export interface GetCategoriesParams {
  page?: number;
  size?: number;
  search?: string;
  categoryStatus?:string;
  startDate?:string;
  endDate?:string;
}

export interface GetAllCategoriesResponse {
  success:boolean;
  responseCode:number;
  responseMessage:string;
  message:string;
  data:{
    content?:Category[]
    totalElements?:number
  } ;
  requestId:number;
  timestamp:Date
}

export interface CategoriesKPIResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    totalCategories: number;
    activeCount: number;
    inactiveCount: number;
    archivedCount: number;
  },
  timestamp: string;
  requestId?:string | null
}

