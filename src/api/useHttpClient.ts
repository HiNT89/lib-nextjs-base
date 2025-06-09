import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useEffect } from "react";
import APP_CONFIG from "@/common/app-config";

const createBaseInstance = (baseURL?: string): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: baseURL || APP_CONFIG.API_URL,
  });

  return axiosInstance;
};

type ResultHttpClient = {
  get: <T>(
    url: string,
    options?: Record<string, string>,
    requestOptions?: AxiosRequestConfig<any>
  ) => Promise<T>;
  post: <T>(
    url: string,
    data: any,
    options?: Record<string, string>
  ) => Promise<T>;
  put: <T>(
    url: string,
    data: any,
    options?: Record<string, string>
  ) => Promise<T>;
  patch: <T>(
    url: string,
    data: any,
    options?: Record<string, string>
  ) => Promise<T>;
  delete: <T>(url: string, options?: Record<string, string>) => Promise<T>;
  axiosBase: AxiosInstance;
};

export default function useHttpClient(baseURL?: string): ResultHttpClient {
  const axiosBase = createBaseInstance(baseURL);
  const axiosAuth = createBaseInstance(baseURL);

  // interceptor
  useEffect(() => {
    // auth
    axiosAuth.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        if (error?.response?.status === 401) {
          // clearAllStore();
          // keyCloak.updateToken();
        }
        if (error?.response?.status === 403) {
          return;
        } else if (error?.response?.status === 413) {
          // Handle "Request Entity Too Large" error
          console.error("Error 413: Request entity too large.");
          alert(
            "The file you are trying to upload is too large. Please try again with a smaller file."
          );
        } else {
          // Handle other errors
          console.error("An error occurred:", error.message);
        }
        return Promise.reject(error);
      }
    );
  }, [axiosAuth, location]);

  //methods

  const getAuth = <T>(
    url: string,
    headers: Record<string, string> = {},
    requestOptions?: AxiosRequestConfig<any>
  ) => {
    return axiosAuth.request({
      url,
      method: "GET",
      headers: {
        ...headers,
      },
      ...(requestOptions ?? {}),
    }) as Promise<T>;
  };

  const postAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ) => {
    return axiosAuth.request({
      url,
      method: "POST",
      data,
      headers: {
        ...headers,
      },
    }) as Promise<T>;
  };

  const putAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ) => {
    return axiosAuth.request({
      url,
      method: "PUT",
      data,
      headers: {
        ...headers,
      },
    }) as Promise<T>;
  };

  const patchAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ) => {
    return axiosAuth.request({
      url,
      method: "PATCH",
      data,
      headers: {
        ...headers,
      },
    }) as Promise<T>;
  };

  const deleteAuth = <T>(url: string, options: Record<string, string> = {}) => {
    return axiosAuth.request({
      url,
      method: "DELETE",
      headers: {
        ...options,
      },
    }) as Promise<T>;
  };

  return {
    get: getAuth,
    post: postAuth,
    put: putAuth,
    patch: patchAuth,
    delete: deleteAuth,
    axiosBase,
  };
}
