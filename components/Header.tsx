
import React from 'react';
import { UploadCloudIcon, XIcon } from './IconComponents';

interface HeaderProps {
  fileName: string;
  onReset: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ fileName, onReset, hasData }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <UploadCloudIcon className="h-8 w-8 text-primary" />
            <h1 className="ml-3 text-2xl font-bold text-text-primary">Trade Data Dashboard</h1>
          </div>
          <div className="flex items-center">
            {hasData && (
              <>
                <span className="text-sm text-text-secondary hidden sm:block">
                  Analyzing: <span className="font-semibold text-text-primary">{fileName}</span>
                </span>
                <button
                  onClick={onReset}
                  className="ml-4 flex items-center bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200"
                  aria-label="Reset and upload new file"
                >
                  <XIcon className="h-4 w-4 mr-2"/>
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
