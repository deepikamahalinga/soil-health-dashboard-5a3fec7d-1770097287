// soilreport.api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export interface SoilReport {
  id: string;
  state: string;
  district: string;
  village: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export type CreateSoilReportDTO = Omit<SoilReport, 'id'>;
export type UpdateSoilReportDTO = Partial<CreateSoilReportDTO>;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  state?: string;
  district?: string;
  village?: string;
  minPh?: number;
  maxPh?: number;
  minNitrogen?: number;
  maxNitrogen?: number;
  minPhosphorus?: number;
  maxPhosphorus?: number;
  minPotassium?: number;
  maxPotassium?: number;
}

export interface SortParams {
  field: keyof SoilReport;
  order: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client
export class SoilReportApi {
  private client: AxiosInstance;
  private static RETRY_COUNT = 3;
  private static RETRY_DELAY = 1000;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL;
    if (!baseURL) throw new Error('API base URL not configured');

    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config;
        if (!config || !config.retry) return Promise.reject(this.handleError(error));

        config.retry = config.retry - 1;
        if (config.retry === 0) {
          return Promise.reject(this.handleError(error));
        }

        await new Promise(resolve => setTimeout(resolve, SoilReportApi.RETRY_DELAY));
        return this.client(config);
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      return new ApiError(
        error.response.status,
        error.response.data?.message || 'An error occurred',
        error.response.data
      );
    }
    return new ApiError(500, error.message || 'Network error');
  }

  async getAllSoilReports(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<SoilReport>> {
    try {
      const response = await this.client.get('/api/soilreports', {
        params: { ...filters, ...pagination, ...sort },
        retry: SoilReportApi.RETRY_COUNT,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async getSoilReportById(id: string): Promise<SoilReport> {
    try {
      const response = await this.client.get(`/api/soilreports/${id}`, {
        retry: SoilReportApi.RETRY_COUNT,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async createSoilReport(data: CreateSoilReportDTO): Promise<SoilReport> {
    try {
      const response = await this.client.post('/api/soilreports', data, {
        retry: SoilReportApi.RETRY_COUNT,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async updateSoilReport(
    id: string,
    data: UpdateSoilReportDTO
  ): Promise<SoilReport> {
    try {
      const response = await this.client.put(`/api/soilreports/${id}`, data, {
        retry: SoilReportApi.RETRY_COUNT,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async deleteSoilReport(id: string): Promise<void> {
    try {
      await this.client.delete(`/api/soilreports/${id}`, {
        retry: SoilReportApi.RETRY_COUNT,
      });
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

// Export singleton instance
export const soilReportApi = new SoilReportApi();