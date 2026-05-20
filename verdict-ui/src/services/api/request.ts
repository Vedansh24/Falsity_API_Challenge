import type { AxiosRequestConfig, Method } from 'axios';
import apiClient from './api-client';
import { normalizeApiResponse, unwrapApiResponse } from './api-response';
import type { ApiResponse } from '../../types/api.types';
import type { QueryParams } from '../../types/api.types';

export type RequestConfig<TBody = unknown> = Omit<AxiosRequestConfig<TBody>, 'method' | 'url' | 'data'> & {
  method: Method;
  url: string;
  data?: TBody;
  params?: QueryParams | Record<string, unknown>;
};

export async function request<TResponse = unknown, TBody = unknown>(config: RequestConfig<TBody>): Promise<TResponse> {
  const response = await apiClient.request(config);
  return unwrapApiResponse<TResponse>(response.data);
}

export async function requestEnvelope<TResponse = unknown, TBody = unknown>(config: RequestConfig<TBody>): Promise<ApiResponse<TResponse>> {
  const response = await apiClient.request(config);
  return normalizeApiResponse<TResponse>(response.data);
}

export const apiRequest = {
  get: <TResponse = unknown>(url: string, config?: Omit<RequestConfig, 'method' | 'url'>) =>
    request<TResponse>({ method: 'GET', url, ...config }),
  post: <TResponse = unknown, TBody = unknown>(url: string, data?: TBody, config?: Omit<RequestConfig<TBody>, 'method' | 'url' | 'data'>) =>
    request<TResponse, TBody>({ method: 'POST', url, data, ...config }),
  put: <TResponse = unknown, TBody = unknown>(url: string, data?: TBody, config?: Omit<RequestConfig<TBody>, 'method' | 'url' | 'data'>) =>
    request<TResponse, TBody>({ method: 'PUT', url, data, ...config }),
  patch: <TResponse = unknown, TBody = unknown>(url: string, data?: TBody, config?: Omit<RequestConfig<TBody>, 'method' | 'url' | 'data'>) =>
    request<TResponse, TBody>({ method: 'PATCH', url, data, ...config }),
  delete: <TResponse = unknown>(url: string, config?: Omit<RequestConfig, 'method' | 'url'>) =>
    request<TResponse>({ method: 'DELETE', url, ...config })
};
