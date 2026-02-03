import { z } from 'zod';

export const UpdateSoilReportDto = z.object({
  state: z.string()
    .min(1, 'State name cannot be empty')
    .optional(),

  district: z.string()
    .min(1, 'District name cannot be empty')
    .optional(),

  village: z.string()
    .min(1, 'Village name cannot be empty')
    .optional(),

  ph: z.number()
    .min(0, 'pH must be between 0 and 14')
    .max(14, 'pH must be between 0 and 14')
    .optional(),

  nitrogen: z.number()
    .positive('Nitrogen content must be positive')
    .optional(),

  phosphorus: z.number()
    .positive('Phosphorus content must be positive')
    .optional(),

  potassium: z.number()
    .positive('Potassium content must be positive')
    .optional(),
}).strict();

export type UpdateSoilReportDto = z.infer<typeof UpdateSoilReportDto>;