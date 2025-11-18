
import React, { useState, useMemo, useCallback } from 'react';
import * as xlsx from 'xlsx';
import { RawTradeData, CleanedTradeData, AnalysisData } from './types';
import { processData } from './services/dataProcessor';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<RawTradeData[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File data is empty.");
        const workbook = xlsx.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: RawTradeData[] = xlsx.utils.sheet_to_json<RawTradeData>(worksheet, {
            // Ensure DATE is parsed as Date object
            raw: false,
        });
        
        setRawData(json);
        const processed = processData(json);
        setAnalysisData(processed);

      } catch (err) {
        console.error("Error processing file:", err);
        setError("Failed to process the Excel file. Please ensure it's a valid .xlsx file with the correct format.");
        setRawData([]);
        setAnalysisData(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleReset = () => {
    setRawData([]);
    setAnalysisData(null);
    setError(null);
    setFileName('');
  };

  const hasData = useMemo(() => analysisData !== null && analysisData.cleanedData.length > 0, [analysisData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header fileName={fileName} onReset={handleReset} hasData={hasData} />
      <main className="p-4 sm:p-6 lg:p-8">
        {!hasData && !isLoading && <FileUpload onFileUpload={handleFileUpload} error={error} />}
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Spinner />
                <p className="mt-4 text-lg text-text-secondary animate-pulse">Analyzing trade data...</p>
                <p className="text-sm text-gray-500">This might take a moment for large files.</p>
            </div>
        )}
        {hasData && analysisData && <Dashboard rawData={rawData} analysisData={analysisData} />}
      </main>
    </div>
  );
};

export default App;
