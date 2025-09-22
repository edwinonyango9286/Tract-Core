export interface CreateCategoryPayload {
  name: string;
  description: string;
}
export interface Category {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
}
export interface GetCategoriesParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface GetAllCategoriesResponse {
  success:boolean;
  responseCode:number;
  responseMessage:string;
  message:string;
  data:Category[];
  requestId:number;
  timestamp:Date
}

