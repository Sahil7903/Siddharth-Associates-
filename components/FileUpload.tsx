
import React, { useCallback, useState } from 'react';
import { FileIcon, AlertTriangleIcon } from './IconComponents';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">Upload Your Trade Data</h2>
        <p className="mt-2 text-gray-600">Drag & drop your .xlsx file here or click to browse.</p>

        <label
          htmlFor="file-upload"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mt-6 flex justify-center w-full h-64 px-6 pt-5 pb-6 border-2 ${
            isDragging ? 'border-primary' : 'border-gray-300'
          } border-dashed rounded-md cursor-pointer transition-colors duration-200 ease-in-out`}
        >
          <div className="space-y-1 text-center self-center">
             <FileIcon className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <div className="flex text-sm text-gray-600">
              <span className="relative bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">XLSX up to 10MB</p>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <AlertTriangleIcon className="h-5 w-5 mr-2" />
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
};
