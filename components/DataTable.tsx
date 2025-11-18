
import React, { useState, useMemo } from 'react';

interface DataTableProps<T> {
  data: T[];
  title: string;
}

export const DataTable = <T extends object,>({ data, title }: DataTableProps<T>): React.ReactElement => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 25;

  const headers = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercasedFilter = searchTerm.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const formatValue = (value: any) => {
    if (value instanceof Date) {
        return value.toLocaleDateString();
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return String(value);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        <input
          type="text"
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="mt-2 sm:mt-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary w-full sm:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{header.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map(header => (
                  <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatValue((row as any)[header])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-700">
          Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="flex space-x-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">Previous</button>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};
