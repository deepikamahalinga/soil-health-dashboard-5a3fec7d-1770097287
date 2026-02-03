// src/services/soil-report.service.ts

import { PrismaClient, SoilReport, Prisma } from '@prisma/client';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';

// Types
export type SoilReportFilters = {
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
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type CreateSoilReportDto = Omit<SoilReport, 'id'>;
export type UpdateSoilReportDto = Partial<CreateSoilReportDto>;

export class SoilReportService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(filters?: SoilReportFilters, pagination?: PaginationParams): Promise<SoilReport[]> {
    const where: Prisma.SoilReportWhereInput = {};
    
    // Apply filters
    if (filters) {
      if (filters.state) where.state = filters.state;
      if (filters.district) where.district = filters.district;
      if (filters.village) where.village = filters.village;
      
      if (filters.phMin || filters.phMax) {
        where.ph = {
          gte: filters.phMin,
          lte: filters.phMax,
        };
      }
      
      if (filters.nitrogenMin || filters.nitrogenMax) {
        where.nitrogen = {
          gte: filters.nitrogenMin,
          lte: filters.nitrogenMax,
        };
      }
      
      // Similar for phosphorus and potassium
    }

    // Apply pagination
    const skip = pagination?.page && pagination?.limit 
      ? (pagination.page - 1) * pagination.limit 
      : undefined;
    const take = pagination?.limit;

    return this.prisma.soilReport.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: string): Promise<SoilReport> {
    const report = await this.prisma.soilReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundError(`Soil report with ID ${id} not found`);
    }

    return report;
  }

  async create(data: CreateSoilReportDto): Promise<SoilReport> {
    // Basic validation
    this.validateSoilReport(data);

    return this.prisma.soilReport.create({
      data,
    });
  }

  async update(id: string, data: UpdateSoilReportDto): Promise<SoilReport> {
    // Check existence
    await this.findById(id);
    
    // Validate updated data
    if (Object.keys(data).length > 0) {
      this.validateSoilReport(data as CreateSoilReportDto);
    }

    return this.prisma.soilReport.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    // Check existence
    await this.findById(id);

    await this.prisma.soilReport.delete({
      where: { id },
    });
  }

  private validateSoilReport(data: Partial<CreateSoilReportDto>): void {
    if (data.ph !== undefined && (data.ph < 0 || data.ph > 14)) {
      throw new ValidationError('pH must be between 0 and 14');
    }

    const positiveFields = ['nitrogen', 'phosphorus', 'potassium'];
    for (const field of positiveFields) {
      if (data[field] !== undefined && data[field] <= 0) {
        throw new ValidationError(`${field} must be positive`);
      }
    }

    // Location hierarchy validation could be added here
  }
}

// Usage example:
// const soilReportService = new SoilReportService();
// const reports = await soilReportService.findAll({ 
//   state: 'Maharashtra',
//   phMin: 6,
//   phMax: 8
// }, { page: 1, limit: 10 });