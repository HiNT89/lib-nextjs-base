import AppConfig from "@/common/app-config";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const createBaseInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: AppConfig.API_URL,
  });
};

const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AppConfig.ACCESS_TOKEN);
  }
  return null;
};

const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AppConfig.REFRESH_TOKEN);
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AppConfig.ACCESS_TOKEN, accessToken);
    localStorage.setItem(AppConfig.REFRESH_TOKEN, refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AppConfig.ACCESS_TOKEN);
    localStorage.removeItem(AppConfig.REFRESH_TOKEN);
  }
};

const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  try {
    const response = await axios.post(`${AppConfig.API_URL}/auth/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    clearTokens();
    throw new Error("Failed to refresh token");
  }
};

export type ResultHttpClient = {
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
  delete: <T>(
    url: string,
    data: any,
    options?: Record<string, string>
  ) => Promise<T>;
  callDynamicApi: <T>(
    domain: string | undefined,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: any,
    headers?: Record<string, string>
  ) => Promise<T>;
  axiosBase: AxiosInstance;
};

const handleSuccess = (response: any) => {
  if (
    response?.status === 200 ||
    response?.data?.code === "200" ||
    response?.code === "200"
  ) {
    return response.data;
  }
  throw new Error("Request failed");
};

export default function useHttpClient(isConvert?: boolean): ResultHttpClient {
  const router = useRouter();
  const [axiosBase] = useState(createBaseInstance);
  const [axiosAuth] = useState(createBaseInstance);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    const asPath = window.location.href;
    const queryString = asPath?.split("?")[1] ? `?${asPath.split("?")[1]}` : "";

    const requestInterceptor = axiosAuth.interceptors.request.use(
      async (config: InternalAxiosRequestConfig<any>) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest =
          error.config as InternalAxiosRequestConfig<any> & {
            _retry?: boolean;
          };

        if (error?.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshAuthToken();
            axiosAuth.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return axiosAuth(originalRequest);
          } catch (err) {
            clearTokens();
            if (typeof window !== "undefined" && pathname.includes("/")) {
              router.push(`/dang-nhap?redirect=${pathname}${queryString}`);
            }
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestInterceptor);
      axiosAuth.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosAuth, router]);

  const getAuth = <T>(
    url: string,
    headers: Record<string, string> = {},
    requestOptions?: AxiosRequestConfig<any>
  ) => {
    return axiosAuth
      .request({
        url,
        method: "GET",
        headers: { ...headers },
        ...(requestOptions ?? {}),
      })
      .then((e) => {
        if (isConvert) return e as T;
        return handleSuccess(e) as T;
      });
  };

  const postAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ) => {
    return axiosAuth
      .request({
        url,
        method: "POST",
        data,
        headers: { ...headers },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  const putAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ) => {
    return axiosAuth
      .request({
        url,
        method: "PUT",
        data,
        headers: { ...headers },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  const patchAuth = <T>(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ) => {
    return axiosAuth
      .request({
        url,
        method: "PATCH",
        data,
        headers: { ...headers },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };

  const deleteAuth = <T>(
    url: string,
    data: any,
    options: Record<string, string> = {}
  ) => {
    return axiosAuth
      .request({
        url,
        method: "DELETE",
        data,
        headers: { ...options },
      })
      .then((e) => (isConvert ? e : handleSuccess(e)) as T);
  };
  const callDynamicApi = async <T>(
    domain: string | undefined,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<T> => {
    const instance = axios.create({ baseURL: domain });

    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await instance.request({
      method,
      url,
      data,
      headers,
    });

    return isConvert ? (response as T) : (handleSuccess(response) as T);
  };

  return {
    get: getAuth,
    post: postAuth,
    put: putAuth,
    patch: patchAuth,
    delete: deleteAuth,
    callDynamicApi,
    axiosBase,
  };
}
