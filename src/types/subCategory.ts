export interface CreateSubCategoryPayload {
  subCategoryCode?:string
  name: string;
  description: string;
  categoryCode: string;
  status: string;
}

export interface GetSubCategoriesParams {
    search?:string;
    page?:number;
    size?:number
}

export interface SubCategory {
  code?: string;
  name?: string;
  description?: string;
  categoryCode?: string;
  categoryName: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
}
export interface GetSubCategoriesResponse {
  success?: boolean;
  responseCode?: number;
  responseMessage?: string;
  message?: string;
  data: {
    content?: SubCategory[];
    totalElements?: number;
  };
}
