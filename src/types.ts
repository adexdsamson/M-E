import { AxiosResponse, AxiosError } from "axios";

export type User = {
  id: string;
  first_name: string,
  last_name: string
};

export type ApiError = {
  status: boolean;
  message: string;
};

export type ApiResponse<T = unknown> = AxiosResponse<T>;
export type ApiResponseError = AxiosError<ApiError>;
