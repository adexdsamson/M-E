import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { storeFunctions } from "@/store/authSlice";
import { config } from "@/config";

export const getAxiosInstance = () => {
  const axiosInstance = axios.create();
  const { token, setReset } = storeFunctions.getState();

  axiosInstance.defaults.baseURL = config.baseUrl;

  if (!token) {
    axiosInstance.defaults.headers.common[
      "X-AUG-KEY"
    ] = `vk6fjvwW.vCrOOaOd1meXtuaebaI6B5yA4IvESMix`;
  }

  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`; //vk6fjvwW.vCrOOaOd1meXtuaebaI6B5yA4IvESMix
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

const TimeoutDelay = 120000;

export const getRequest = async (url: string) => {
  const res = await getAxiosInstance().get(`/${url}`, {
    signal: AbortSignal.timeout(TimeoutDelay),
  });
  return res;
};

export const postRequest = async <T = unknown>(
  url: string,
  payload: T,
  config?: AxiosRequestConfig
) => {
  const res = await getAxiosInstance().post(`${url}`, payload, {
    ...config,
    signal: AbortSignal.timeout(TimeoutDelay),
  });
  return res;
};

export const patchRequest = async <T = unknown>(url: string, payload: T) => {
  const res = await getAxiosInstance().patch(`${url}`, payload, {
    signal: AbortSignal.timeout(TimeoutDelay),
  });
  return res;
};

export const putRequest = async <T = unknown>(url: string, payload: T) => {
  const res = await getAxiosInstance().put(`${url}`, payload, {
    signal: AbortSignal.timeout(TimeoutDelay),
  });
  return res;
};

export const deleteRequest = async <T = unknown>(url: string, payload?: T) => {
  const res = await getAxiosInstance().delete(`${url}`, {
    data: payload,
    signal: AbortSignal.timeout(TimeoutDelay),
  });
  return res;
};
