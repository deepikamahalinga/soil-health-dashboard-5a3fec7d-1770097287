import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SoilReport } from '../types/SoilReport';
import { getSoilReport, updateSoilReport } from '../api/soilReports';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';

const schema = z.object({
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'), 
  village: z.string().min(1, 'Village is required'),
  ph: z.number()
    .min(0, 'pH must be between 0 and 14')
    .max(14, 'pH must be between 0 and 14'),
  nitrogen: z.number().positive('Nitrogen must be positive'),
  phosphorus: z.number().positive('Phosphorus must be positive'),
  potassium: z.number().positive('Potassium must be positive')
});

type FormData = z.infer<typeof schema>;

export default function SoilReportEdit() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    state: '',
    district: '',
    village: '',
    ph: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0
  });

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    async function loadSoilReport() {
      try {
        const report = await getSoilReport(id!);
        if (!report) {
          setNotFound(true);
          return;
        }
        const data = {
          state: report.state,
          district: report.district,
          village: report.village,
          ph: report.ph,
          nitrogen: report.nitrogen,
          phosphorus: report.phosphorus,
          potassium: report.potassium
        };
        setFormData(data);
        setOriginalData(data);
      } catch (err) {
        setError('Failed to load soil report');
      } finally {
        setLoading(false);
      }
    }
    loadSoilReport();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'state' || name === 'district' || name === 'village' 
        ? value 
        : parseFloat(value)
    }));
  };

  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = schema.parse(formData);
      setSubmitting(true);
      
      await updateSoilReport(id!, {
        ...validated,
        id: id!
      });
      
      navigate(`/soil-reports/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path[0] as keyof FormData] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setError('Failed to update soil report');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (notFound) return <Alert type="error">Soil report not found</Alert>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Soil Report</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <input
              type="text" 
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Village</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
            {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">pH Level</label>
            <input
              type="number"
              name="ph"
              value={formData.ph}
              onChange={handleChange}
              step="0.1"
              className="w-full rounded border p-2"
            />
            {errors.ph && <p className="text-red-500 text-sm mt-1">{errors.ph}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nitrogen (kg/ha)</label>
            <input
              type="number"
              name="nitrogen"
              value={formData.nitrogen}
              onChange={handleChange}
              step="0.01"
              className="w-full rounded border p-2"
            />
            {errors.nitrogen && <p className="text-red-500 text-sm mt-1">{errors.nitrogen}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phosphorus (kg/ha)</label>
            <input
              type="number"
              name="phosphorus"
              value={formData.phosphorus}
              onChange={handleChange}
              step="0.01"
              className="w-full rounded border p-2"
            />
            {errors.phosphorus && <p className="text-red-500 text-sm mt-1">{errors.phosphorus}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Potassium (kg/ha)</label>
            <input
              type="number"
              name="potassium"
              value={formData.potassium}
              onChange={handleChange}
              step="0.01"
              className="w-full rounded border p-2"
            />
            {errors.potassium && <p className="text-red-500 text-sm mt-1">{errors.potassium}</p>}
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}