import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Define validation schema
const soilReportSchema = z.object({
  id: z.string().uuid(),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  village: z.string().min(1, 'Village is required'),
  ph: z.number()
    .min(0, 'pH must be at least 0')
    .max(14, 'pH must be at most 14'),
  nitrogen: z.number().positive('Nitrogen must be positive'),
  phosphorus: z.number().positive('Phosphorus must be positive'),
  potassium: z.number().positive('Potassium must be positive'),
});

type SoilReportFormData = z.infer<typeof soilReportSchema>;

const SoilReportCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<SoilReportFormData>({
    id: uuidv4(),
    state: '',
    district: '',
    village: '',
    ph: 7,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberFields = ['ph', 'nitrogen', 'phosphorus', 'potassium'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numberFields.includes(name) ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      soilReportSchema.parse(formData);
      setIsLoading(true);

      // TODO: Replace with actual API call
      // await createSoilReport(formData);

      navigate('/soil-reports');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Soil Report</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Location Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Village
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.village && (
                <p className="mt-1 text-sm text-red-600">{errors.village}</p>
              )}
            </div>
          </div>
        </div>

        {/* Soil Parameters Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Soil Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                pH Level
              </label>
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="14"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.ph && (
                <p className="mt-1 text-sm text-red-600">{errors.ph}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nitrogen (kg/ha)
              </label>
              <input
                type="number"
                name="nitrogen"
                value={formData.nitrogen}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.nitrogen && (
                <p className="mt-1 text-sm text-red-600">{errors.nitrogen}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phosphorus (kg/ha)
              </label>
              <input
                type="number"
                name="phosphorus"
                value={formData.phosphorus}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.phosphorus && (
                <p className="mt-1 text-sm text-red-600">{errors.phosphorus}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Potassium (kg/ha)
              </label>
              <input
                type="number"
                name="potassium"
                value={formData.potassium}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              {errors.potassium && (
                <p className="mt-1 text-sm text-red-600">{errors.potassium}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/soil-reports')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Create Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoilReportCreate;