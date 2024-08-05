import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { storeFunctions } from "@/store/authSlice";
import { config } from "@/config";

export const getAxiosInstance = () => {
  const axiosInstance = axios.create();
  const { token, setReset } = storeFunctions.getState();

  axiosInstance.defaults.baseURL = config.baseUrl;

  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  axiosInstance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const isUnauthorized = error.response && error.response.status === 401;
      if (isUnauthorized) {
        // Redirect out to Login screen
        setReset();
      }

      return Promise.reject(error);
    }
  );

  axiosInstance.defaults.headers.common["Content-Type"] = "application/json";
  axiosInstance.defaults.headers.common["Accept"] = "application/json";

  axiosInstance.defaults.withCredentials = false;

  return axiosInstance;
};

export const getRequest = async (url: string) => {
  const res = await getAxiosInstance().get(`/${url}`);
  return res;
};

export const postRequest = async <T = unknown>(
  url: string,
  payload: T,
  config?: AxiosRequestConfig
) => {
  const res = await getAxiosInstance().post(`${url}`, payload, config);
  return res;
};

export const patchRequest = async <T = unknown>(url: string, payload: T) => {
  const res = await getAxiosInstance().patch(`${url}`, payload);
  return res;
};

export const putRequest = async <T = unknown>(url: string, payload: T) => {
  const res = await getAxiosInstance().put(`${url}`, payload);
  return res;
};

export const deleteRequest = async <T = unknown>(url: string, payload?: T) => {
  const res = await getAxiosInstance().delete(`${url}`, { data: payload });
  return res;
};
