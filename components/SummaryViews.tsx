
import React from 'react';
import { YearlySummary, HsnSummary } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './IconComponents';

interface SummaryViewsProps {
    yearlySummary: YearlySummary[];
    topHsnSummary: HsnSummary[];
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

export const SummaryViews: React.FC<SummaryViewsProps> = ({ yearlySummary, topHsnSummary }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Year-wise Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Year-wise Summary</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">YoY Growth</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {yearlySummary.map((item) => (
                                <tr key={item.year} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.year}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(item.grandTotalINR)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                                        {item.yoyGrowth !== undefined ? (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                item.yoyGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.yoyGrowth >= 0 ? <ArrowUpIcon className="w-4 h-4 mr-1"/> : <ArrowDownIcon className="w-4 h-4 mr-1"/>}
                                                {formatPercentage(item.yoyGrowth)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* HSN-wise Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-text-primary mb-4">HSN-wise Contribution (Top 25)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN Code</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topHsnSummary.map((item) => (
                                <tr key={item.hsnCode} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={item.hsnDescription}>{item.hsnCode}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(item.grandTotalINR)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatPercentage(item.contribution)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
