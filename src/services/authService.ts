import type { CreateAccountPayload, SignInPayload } from "../types/auth";
import { apiClient } from "../utils/apiClient";

export const createUserService = async (userDetails: CreateAccountPayload) => {
  try {
    const response = await apiClient.post(`auth/aims/register`, userDetails);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signInUserService = async (signInData: SignInPayload) => {
  try {
    const response = await apiClient.post(`auth/aims/authenticate`, signInData);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post(``);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
