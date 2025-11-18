import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
// FIX: Import SupplierSummary type to be used for type assertion.
import { AnalysisData, SupplierSummary } from '../types';

interface ChartsDashboardProps {
  analysisData: AnalysisData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(2)} Cr`;
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const ChartsDashboard: React.FC<ChartsDashboardProps> = ({ analysisData }) => {
    const { yearlySummary, topHsnSummary, supplierSummaryByYear } = analysisData;
    
    const hsnPieData = topHsnSummary.map(item => ({
        name: item.hsnCode,
        value: item.grandTotalINR,
    }));

    const latestYear = Math.max(...Object.keys(supplierSummaryByYear).map(Number));
    const latestYearSuppliers = supplierSummaryByYear[latestYear] || [];

    const activeSuppliers = latestYearSuppliers.map(s => s.iec);
    const supplierTrendData = Object.entries(supplierSummaryByYear).map(([year, suppliers]) => {
        const yearData: {[key: string]: string | number} = { year: year };
        activeSuppliers.forEach(iec => {
            // FIX: The type of 'suppliers' was inferred as 'unknown'. Cast it to the correct type.
            const supplier = (suppliers as SupplierSummary[]).find(s => s.iec === iec);
            yearData[iec] = supplier ? supplier.totalValueINR : 0;
        });
        return yearData;
    });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 col-span-1 xl:col-span-2">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Yearly Grand Total (in Crores)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlySummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={val => `₹${(val / 10000000).toFixed(0)}`} label={{ value: 'INR (Crores)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="grandTotalINR" fill="#1e40af" name="Grand Total" />
            <Bar dataKey="totalValueINR" fill="#3b82f6" name="Total Value" />
            <Bar dataKey="dutyPaidINR" fill="#93c5fd" name="Duty Paid" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Top HSN Contribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={hsnPieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + (radius + 20) * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + (radius + 20) * Math.sin(-midAngle * (Math.PI / 180));
                return (percent > 0.03) ? (
                  <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                ) : null;
              }}
            >
              {hsnPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Active Supplier Trends ({latestYear})</h3>
         <ResponsiveContainer width="100%" height={400}>
          <LineChart data={supplierTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={val => `₹${(val / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(2)} L`} />
            <Legend />
            {activeSuppliers.slice(0, 5).map((iec, index) => (
                 <Line key={iec} type="monotone" dataKey={iec} stroke={COLORS[index % COLORS.length]} name={latestYearSuppliers.find(s=>s.iec===iec)?.importerName.split(' ')[0]} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};