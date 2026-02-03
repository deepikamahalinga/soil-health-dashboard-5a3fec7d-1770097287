import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

import { SoilReport } from '../types/SoilReport';
import { getSoilReport, deleteSoilReport } from '../api/soilReportApi';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

const SoilReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<SoilReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSoilReport();
  }, [id]);

  const fetchSoilReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSoilReport(id!);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch soil report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSoilReport(id!);
      navigate('/soil-reports');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete soil report');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorAlert
        message={error}
        onRetry={fetchSoilReport}
      />
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Soil Report Not Found</h2>
        <button
          onClick={() => navigate('/soil-reports')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Soil Reports', href: '/soil-reports' },
          { label: `Report ${report.id.slice(0, 8)}`, href: '#' },
        ]}
      />

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Soil Report Details</h2>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/soil-reports')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <button
              onClick={() => navigate(`/soil-reports/${id}/edit`)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">State</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.state}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">District</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.district}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Village</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.village}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">pH Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.ph.toFixed(2)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nitrogen (kg/ha)</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.nitrogen.toFixed(2)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phosphorus (kg/ha)</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.phosphorus.toFixed(2)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Potassium (kg/ha)</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.potassium.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                  Delete Soil Report
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this soil report? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default SoilReportDetail;