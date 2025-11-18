
import React, { useMemo, useState } from 'react';
import { CleanedTradeData } from '../types';

interface DetailedAnalysisProps {
  cleanedData: CleanedTradeData[];
}

const formatCurrency = (value: number, code = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(value);
}

export const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ cleanedData }) => {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const yearWiseModelQty = useMemo(() => {
        const result: Record<string, Record<number, number>> = {};
        cleanedData.forEach(d => {
            if (d['Model Name/Number'] === 'N/A') return;
            if (!result[d['Model Name/Number']]) result[d['Model Name/Number']] = {};
            result[d['Model Name/Number']][d.year] = (result[d['Model Name/Number']][d.year] || 0) + d.QUANTITY;
        });
        return result;
    }, [cleanedData]);

    const supplierComparison = useMemo(() => {
        if (!selectedModel) return [];
        const modelData = cleanedData.filter(d => d['Model Name/Number'] === selectedModel);
        const result: Record<string, { prices: number[], avg: number, name: string }> = {};
        modelData.forEach(d => {
            const price = d['UNIT PRICE_USD (Parsed)'] || d['UNIT PRICE_USD'];
            if (!result[d.IEC]) result[d.IEC] = { prices: [], avg: 0, name: d['IMPORTER NAME'] };
            result[d.IEC].prices.push(price);
        });
        Object.keys(result).forEach(iec => {
            const sum = result[iec].prices.reduce((a, b) => a + b, 0);
            result[iec].avg = sum / result[iec].prices.length;
        });
        return Object.entries(result).map(([iec, data]) => ({ iec, name: data.name, avgPrice: data.avg })).sort((a, b) => a.avgPrice - b.avgPrice);
    }, [cleanedData, selectedModel]);
    
    const uniqueModels = useMemo(() => [...new Set(cleanedData.map(d => d['Model Name/Number']))].filter(m => m !== 'N/A').sort(), [cleanedData]);
    if (selectedModel === null && uniqueModels.length > 0) {
        setSelectedModel(uniqueModels[0]);
    }


    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Year-wise Model Quantity</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                             <tr>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                                 {Object.keys(Object.values(yearWiseModelQty)[0] || {}).sort().map(year => (
                                     <th key={year} className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{year}</th>
                                 ))}
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {Object.entries(yearWiseModelQty).slice(0, 15).map(([model, yearData]) => (
                                 <tr key={model}>
                                     <td className="px-4 py-2 whitespace-nowrap font-medium">{model}</td>
                                     {Object.keys(yearData).sort().map(year => (
                                         <td key={year} className="px-4 py-2 text-right">{yearData[parseInt(year)].toLocaleString()}</td>
                                     ))}
                                 </tr>
                             ))}
                         </tbody>
                    </table>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">Showing top 15 models.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Supplier Price Comparison for Same Model</h3>
                <div className="mb-4">
                    <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">Select Model:</label>
                    <select id="model-select" value={selectedModel || ''} onChange={(e) => setSelectedModel(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                        {uniqueModels.map(model => <option key={model} value={model}>{model}</option>)}
                    </select>
                </div>
                {selectedModel && supplierComparison.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier (IEC)</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Importer Name</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Average Unit Price (USD)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {supplierComparison.map(({iec, name, avgPrice}) => (
                                    <tr key={iec}>
                                        <td className="px-4 py-2 whitespace-nowrap font-medium">{iec}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{name}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(avgPrice, 'USD')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {selectedModel && supplierComparison.length === 0 && (
                    <p className="text-gray-500">No comparative data available for this model.</p>
                )}
            </div>
        </div>
    );
};
