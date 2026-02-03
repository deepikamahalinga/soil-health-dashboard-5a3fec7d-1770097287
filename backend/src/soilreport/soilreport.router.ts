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

export interface CreateSoilReportDTO {
  state: string;
  district: string;
  village: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface UpdateSoilReportDTO extends Partial<CreateSoilReportDTO> {}