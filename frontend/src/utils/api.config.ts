// api.config.ts

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: RequestConfig): RequestConfig => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as RequestConfig;

    // Handle unauthorized errors
    if (error.response?.status === 401 && !originalRequest?.retry) {
      originalRequest.retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // Implement refresh token logic here if needed
        // const newToken = await refreshAccessToken(refreshToken);
        // localStorage.setItem('authToken', newToken);
        return api(originalRequest);
      } catch (err) {
        // Handle refresh token failure
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Format error response
    const errorResponse: ApiError = {
      message: error.response?.data?.message || 'An unexpected error occurred',
      code: error.response?.data?.code,
      status: error.response?.status
    };

    return Promise.reject(errorResponse);
  }
);

export default api;

// Export types
export type { ApiError, RequestConfig };