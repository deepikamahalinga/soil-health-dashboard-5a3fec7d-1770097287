import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Dialog, Menu } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Types
interface SoilReport {
  id: string;
  state: string;
  district: string;
  village: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface SortConfig {
  field: keyof SoilReport;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  state?: string;
  district?: string;
  village?: string;
}

const SoilReportList = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortConfig>({ field: 'state', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch data using React Query
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['soilReports', page, pageSize, sort, filters],
    async () => {
      // Replace with actual API call
      const response = await fetch('/api/soil-reports', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, pageSize, sort, filters }),
      });
      if (!response.ok) throw new Error('Failed to fetch soil reports');
      return response.json();
    }
  );

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      // Replace with actual API call
      await fetch(`/api/soil-reports/${id}`, { method: 'DELETE' });
      toast.success('Soil report deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete soil report');
    }
    setDeleteId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-md mb-2" />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!data?.reports?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No soil reports found</p>
        <button
          onClick={() => router.push('/soil-reports/new')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Create New Report
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Soil Reports</h1>
        <button
          onClick={() => router.push('/soil-reports/new')}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Report
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['state', 'district', 'village'].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={`Filter by ${field}`}
            className="px-4 py-2 border rounded-md"
            onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
          />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {['State', 'District', 'Village', 'pH', 'N', 'P', 'K', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 border-b text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.reports.map((report: SoilReport) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{report.state}</td>
                <td className="px-6 py-4 border-b">{report.district}</td>
                <td className="px-6 py-4 border-b">{report.village}</td>
                <td className="px-6 py-4 border-b">{report.ph}</td>
                <td className="px-6 py-4 border-b">{report.nitrogen}</td>
                <td className="px-6 py-4 border-b">{report.phosphorus}</td>
                <td className="px-6 py-4 border-b">{report.potassium}</td>
                <td className="px-6 py-4 border-b">
                  <Menu as="div" className="relative">
                    <Menu.Button className="px-4 py-2 bg-gray-100 rounded-md">
                      Actions <ChevronDownIcon className="w-5 h-5 inline" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg">
                      <Menu.Item>
                        <button
                          onClick={() => router.push(`/soil-reports/${report.id}`)}
                          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          View
                        </button>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => router.push(`/soil-reports/${report.id}/edit`)}
                          className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                          Edit
                        </button>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => setDeleteId(report.id)}
                          className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
                        >
                          Delete
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 border rounded-md"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!data.hasMore}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8">
            <Dialog.Title className="text-lg font-bold mb-4">Confirm Delete</Dialog.Title>
            <p>Are you sure you want to delete this soil report?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SoilReportList;