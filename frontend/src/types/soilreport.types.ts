// soilreport.types.ts

import { z } from 'zod';

/**
 * Enum for valid sort directions
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Enum for sortable fields
 */
export enum SortableField {
  ID = 'id',
  STATE = 'state',
  DISTRICT = 'district',
  VILLAGE = 'village',
  PH = 'ph',
  NITROGEN = 'nitrogen',
  PHOSPHORUS = 'phosphorus',
  POTASSIUM = 'potassium'
}

/**
 * Main SoilReport entity interface
 * @interface
 */
export interface SoilReport {
  /** Unique identifier */
  id: string;
  /** Indian state name */
  state: string;
  /** District name within state */
  district: string;
  /** Village name */
  village: string;
  /** Soil pH level (0-14) */
  ph: number;
  /** Nitrogen content in kg/ha */
  nitrogen: number;
  /** Phosphorus content in kg/ha */
  phosphorus: number;
  /** Potassium content in kg/ha */
  potassium: number;
  /** Record creation timestamp */
  createdAt: Date;
  /** Record last update timestamp */
  updatedAt: Date;
}

/**
 * DTO for creating new soil reports
 * @interface
 */
export type CreateSoilReportDto = Omit<SoilReport, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * DTO for updating soil reports
 * @interface
 */
export type UpdateSoilReportDto = Partial<CreateSoilReportDto>;

/**
 * Filter parameters for querying soil reports
 * @interface
 */
export interface SoilReportFilterParams {
  state?: string;
  district?: string;
  village?: string;
  phMin?: number;
  phMax?: number;
  nitrogenMin?: number;
  nitrogenMax?: number;
  phosphorusMin?: number;
  phosphorusMax?: number;
  potassiumMin?: number;
  potassiumMax?: number;
}

/**
 * Pagination parameters
 * @interface
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Items per page */
  limit: number;
}

/**
 * Sort parameters
 * @interface
 */
export interface SortParams {
  /** Field to sort by */
  field: SortableField;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * API response wrapper with metadata
 * @interface
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Response metadata */
  metadata: {
    /** Total number of items */
    total: number;
    /** Current page number */
    page: number;
    /** Items per page */
    limit: number;
    /** Total number of pages */
    totalPages: number;
  };
}

/**
 * Zod validation schema for soil report
 */
export const soilReportSchema = z.object({
  id: z.string().uuid(),
  state: z.string().min(1),
  district: z.string().min(1),
  village: z.string().min(1),
  ph: z.number().min(0).max(14),
  nitrogen: z.number().positive(),
  phosphorus: z.number().positive(),
  potassium: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Zod validation schema for creating soil reports
 */
export const createSoilReportSchema = soilReportSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Zod validation schema for updating soil reports
 */
export const updateSoilReportSchema = createSoilReportSchema.partial();

/**
 * Type alias for paginated soil report response
 */
export type PaginatedSoilReportResponse = ApiResponse<SoilReport[]>;

/**
 * Type alias for single soil report response
 */
export type SoilReportResponse = ApiResponse<SoilReport>;