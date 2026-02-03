/**
 * Core soil health data for a specific location
 * @interface SoilReport
 */
export interface SoilReport {
  /**
   * Unique identifier for soil report
   * @format uuid
   */
  id: string;

  /**
   * Indian state name
   * @minLength 1
   */
  state: string;

  /**
   * District name within state
   * @minLength 1
   */
  district: string;

  /**
   * Village name
   * @minLength 1
   */
  village: string;

  /**
   * Soil pH level
   * @minimum 0
   * @maximum 14
   */
  ph: number;

  /**
   * Nitrogen content in kg/ha
   * @minimum 0
   */
  nitrogen: number;

  /**
   * Phosphorus content in kg/ha
   * @minimum 0
   */
  phosphorus: number;

  /**
   * Potassium content in kg/ha
   * @minimum 0
   */
  potassium: number;
}

/**
 * Partial type for updating soil report
 */
export type UpdateSoilReport = Partial<Omit<SoilReport, 'id'>>;

/**
 * Type for creating new soil report without ID
 */
export type CreateSoilReport = Omit<SoilReport, 'id'>;

/**
 * Location parameters for querying soil reports
 */
export interface SoilReportLocation {
  state: string;
  district: string;
  village: string;
}

/**
 * Filter parameters for soil report queries
 */
export interface SoilReportFilters {
  phRange?: {
    min?: number;
    max?: number;
  };
  nitrogenRange?: {
    min?: number;
    max?: number;
  };
  phosphorusRange?: {
    min?: number;
    max?: number;
  };
  potassiumRange?: {
    min?: number;
    max?: number;
  };
}