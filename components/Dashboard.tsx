
import React, { useState } from 'react';
import { AnalysisData, RawTradeData } from '../types';
import { DataTable } from './DataTable';
import { SummaryViews } from './SummaryViews';
import { ChartsDashboard } from './ChartsDashboard';
import { DetailedAnalysis } from './DetailedAnalysis';
import { AiAnalyst } from './AiAnalyst';
import { TableIcon, ChartBarIcon, ListIcon, SparklesIcon, DatabaseIcon } from './IconComponents';

interface DashboardProps {
  rawData: RawTradeData[];
  analysisData: AnalysisData;
}

type Tab = 'summary' | 'charts' | 'details' | 'ai' | 'cleaned' | 'raw';

export const Dashboard: React.FC<DashboardProps> = ({ rawData, analysisData }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const tabs: { id: Tab; name: string; icon: React.FC<any> }[] = [
    { id: 'summary', name: 'Summaries', icon: TableIcon },
    { id: 'charts', name: 'Charts', icon: ChartBarIcon },
    { id: 'details', name: 'Detailed Analysis', icon: ListIcon },
    { id: 'ai', name: 'AI Analyst', icon: SparklesIcon },
    { id: 'cleaned', name: 'Cleaned Data', icon: DatabaseIcon },
    { id: 'raw', name: 'Raw Data', icon: DatabaseIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryViews yearlySummary={analysisData.yearlySummary} topHsnSummary={analysisData.topHsnSummary} />;
      case 'charts':
        return <ChartsDashboard analysisData={analysisData} />;
      case 'details':
        return <DetailedAnalysis cleanedData={analysisData.cleanedData} />;
      case 'ai':
        return <AiAnalyst analysisData={analysisData} />;
      case 'cleaned':
        return <DataTable data={analysisData.cleanedData} title="Cleaned & Augmented Data" />;
      case 'raw':
        return <DataTable data={rawData} title="Raw Data" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap`}
            >
              <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="transition-opacity duration-300 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
};
