export interface CreateSubCategoryPayload {
  subCategoryCode?: string;
  name: string;
  description: string;
  categoryCode: string;
  status: string;
}

export interface GetSubCategoriesParams {
  search?: string;
  page?: number;
  size?: number;
  status?:string;
  startDate?:string;
  endDate?:string;
}
export interface DeactivateSubCategoryPayload {
  subCategoryCode?: string;
  categoryCode?: string;
  status?: string;
  name?: string;
  description?: string;
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

export interface SubCategoryKPI {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  message: string;
  data: {
    totalSubCategories: number;
    byStatus: {
      [categoryName: string]: number;
    };

    byCategory: {
      [categoryName: string]: number;
    };
    createdLast30Days: number;
    updatedLast30Days: number;
  };
  timestamp: string;
  requestId: string | null;
}
