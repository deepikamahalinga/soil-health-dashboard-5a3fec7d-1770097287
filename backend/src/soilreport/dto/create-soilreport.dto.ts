import { z } from 'zod';

/**
 * DTO Schema for creating a new soil report
 * Validates input data for soil report creation
 */
export const CreateSoilReportSchema = z.object({
  // Location details
  state: z.string()
    .min(1, 'State name is required')
    .max(100, 'State name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'State name must contain only letters and spaces'),

  district: z.string()
    .min(1, 'District name is required') 
    .max(100, 'District name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'District name must contain only letters and spaces'),

  village: z.string()
    .min(1, 'Village name is required')
    .max(100, 'Village name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Village name must contain only letters and spaces'),

  // Soil properties
  ph: z.number()
    .min(0, 'pH must be at least 0')
    .max(14, 'pH cannot exceed 14')
    .multipleOf(0.1), // Allow one decimal place

  nitrogen: z.number()
    .positive('Nitrogen content must be positive')
    .max(9999.99, 'Nitrogen content too high')
    .multipleOf(0.01), // Allow two decimal places

  phosphorus: z.number()
    .positive('Phosphorus content must be positive')
    .max(9999.99, 'Phosphorus content too high')
    .multipleOf(0.01), // Allow two decimal places

  potassium: z.number()
    .positive('Potassium content must be positive')
    .max(9999.99, 'Potassium content too high')
    .multipleOf(0.01), // Allow two decimal places
});

/**
 * Type definition for soil report creation payload
 */
export type CreateSoilReportDTO = z.infer<typeof CreateSoilReportSchema>;