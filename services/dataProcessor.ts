
import { RawTradeData, CleanedTradeData, AnalysisData, YearlySummary, HsnSummary, ModelSummary, SupplierSummary } from '../types';
import { HSN_DESCRIPTIONS } from '../constants';

// Helper function for parsing descriptions
const parseGoodsDescription = (desc: string): { model: string, capacity: string, itemQty: number | null, unitPrice: number | null } => {
    const descLower = desc.toLowerCase();
    
    // Model/Number
    let model = 'N/A';
    const modelMatch = desc.match(/(?:ITEM|MODEL|ART|CODE)\s*[:\-\s]*\s*([A-Z0-9\-\/]+)/i);
    if (modelMatch) {
        model = modelMatch[1];
    }

    // Capacity
    let capacity = 'N/A';
    const capacityMatch = desc.match(/(\d+\s*(?:ML|L|LITRE|KG|GM))/i);
    if (capacityMatch) {
        capacity = capacityMatch[1].toUpperCase();
    }

    // Item Qty
    let itemQty = null;
    const qtyMatch = desc.match(/QTY\s*:\s*(\d+)\s*PCS/i);
    if (qtyMatch) {
        itemQty = parseInt(qtyMatch[1], 10);
    } else {
        const setMatch = desc.match(/SET\s*OF\s*(\d+)/i);
        if (setMatch) {
            itemQty = parseInt(setMatch[1], 10);
        }
    }

    // Unit Price USD
    let unitPrice = null;
    const priceMatch = desc.match(/USD\s*([\d.]+)\s*PER\s*(?:PCS|PC)/i);
    if (priceMatch) {
        unitPrice = parseFloat(priceMatch[1]);
    }
    
    return { model, capacity, itemQty, unitPrice };
};

const getSubCategory = (desc: string): string => {
    const descLower = desc.toLowerCase();
    if (descLower.includes('cutlery holder')) return 'Cutlery Holder';
    if (descLower.includes('tea strainer')) return 'Tea Strainer';
    if (descLower.includes('scrubber')) return 'Scrubber Set';
    if (descLower.includes('bottle')) return 'Bottle';
    if (descLower.includes('tiffin') || descLower.includes('lunch box')) return 'Lunch Box';
    if (descLower.includes('bowl')) return 'Bowl';
    if (descLower.includes('plate')) return 'Plate';
    if (descLower.includes('tray')) return 'Tray';
    return 'Other';
};


export const processData = (rawData: RawTradeData[]): AnalysisData => {
    const totalDutyPaid = rawData.reduce((sum, row) => sum + (row['DUTY PAID_INR'] || 0), 0);
    const totalValue = rawData.reduce((sum, row) => sum + (row['TOTAL VALUE_INR'] || 0), 0);
    const overallDutyPercentage = totalValue > 0 ? (totalDutyPaid / totalValue) : 0;

    const cleanedData: CleanedTradeData[] = rawData.map(row => {
        const parsed = parseGoodsDescription(row['GOODS DESCRIPTION']);
        const grandTotal = (row['TOTAL VALUE_INR'] || 0) + (row['DUTY PAID_INR'] || 0);
        const hsnCode = String(row['HS CODE']);
        
        const dutyPaid = row['DUTY PAID_INR'] || 0;
        const totalValueINR = row['TOTAL VALUE_INR'] || 0;
        const calculatedDutyPercentage = totalValueINR > 0 ? (dutyPaid / totalValueINR) : 0;

        return {
            ...row,
            year: new Date(row.DATE).getFullYear(),
            'Grand Total_INR': grandTotal,
            'Model Name/Number': parsed.model,
            'Capacity': parsed.capacity,
            'Item Qty': parsed.itemQty,
            'Unit Price_USD (Parsed)': parsed.unitPrice,
            'Main Category': hsnCode.startsWith('73') ? 'Steel' : 'Others',
            'Sub-category': getSubCategory(row['GOODS DESCRIPTION']),
            isExceptionalDuty: calculatedDutyPercentage > overallDutyPercentage,
            'Per Unit Cost With Duty_INR': (row.QUANTITY > 0) ? ((row['UNIT PRICE_INR'] || 0) + (dutyPaid / row.QUANTITY)) : (row['UNIT PRICE_INR'] || 0),
        };
    });

    // Yearly Summary
    const yearlyData: Record<number, { totalValue: number, duty: number, grandTotal: number }> = {};
    cleanedData.forEach(row => {
        if (!yearlyData[row.year]) {
            yearlyData[row.year] = { totalValue: 0, duty: 0, grandTotal: 0 };
        }
        yearlyData[row.year].totalValue += row['TOTAL VALUE_INR'];
        yearlyData[row.year].duty += row['DUTY PAID_INR'];
        yearlyData[row.year].grandTotal += row['Grand Total_INR'];
    });

    const yearlySummary: YearlySummary[] = Object.keys(yearlyData).map(Number).sort().map((year, index, arr) => {
        const prevYear = arr[index - 1];
        const prevYearGrandTotal = prevYear ? yearlyData[prevYear].grandTotal : 0;
        const currentGrandTotal = yearlyData[year].grandTotal;
        const yoyGrowth = prevYearGrandTotal > 0 ? ((currentGrandTotal - prevYearGrandTotal) / prevYearGrandTotal) : undefined;
        return {
            year: year,
            totalValueINR: yearlyData[year].totalValue,
            dutyPaidINR: yearlyData[year].duty,
            grandTotalINR: yearlyData[year].grandTotal,
            yoyGrowth: yoyGrowth
        };
    });

    // HSN Summary
    const hsnData: Record<string, { desc: string, totalValue: number, duty: number, grandTotal: number }> = {};
    cleanedData.forEach(row => {
        const hsn = String(row['HS CODE']);
        if (!hsnData[hsn]) {
            hsnData[hsn] = { desc: HSN_DESCRIPTIONS[hsn] || row['HSN DESCRIPTION'], totalValue: 0, duty: 0, grandTotal: 0 };
        }
        hsnData[hsn].totalValue += row['TOTAL VALUE_INR'];
        hsnData[hsn].duty += row['DUTY PAID_INR'];
        hsnData[hsn].grandTotal += row['Grand Total_INR'];
    });

    const overallGrandTotal = yearlySummary.reduce((sum, year) => sum + year.grandTotalINR, 0);
    const hsnSummary: HsnSummary[] = Object.keys(hsnData).map(hsn => ({
        hsnCode: hsn,
        hsnDescription: hsnData[hsn].desc,
        totalValueINR: hsnData[hsn].totalValue,
        dutyPaidINR: hsnData[hsn].duty,
        grandTotalINR: hsnData[hsn].grandTotal,
        contribution: overallGrandTotal > 0 ? (hsnData[hsn].grandTotal / overallGrandTotal) : 0,
    })).sort((a, b) => b.grandTotalINR - a.grandTotalINR);

    const topHsn = hsnSummary.slice(0, 25);
    const otherHsnTotal = hsnSummary.slice(25).reduce((sum, hsn) => sum + hsn.grandTotalINR, 0);
    const otherHsnContribution = overallGrandTotal > 0 ? otherHsnTotal / overallGrandTotal : 0;
    
    const topHsnSummary = [...topHsn];
    if (hsnSummary.length > 25) {
        topHsnSummary.push({
            hsnCode: 'Others',
            hsnDescription: 'Sum of other HSN codes',
            totalValueINR: 0,
            dutyPaidINR: 0,
            grandTotalINR: otherHsnTotal,
            contribution: otherHsnContribution,
        });
    }

    // Model Summary
    const modelData: Record<string, { qty: number, value: number, count: number }> = {};
    cleanedData.forEach(row => {
        const model = row['Model Name/Number'];
        if (model === 'N/A') return;
        if (!modelData[model]) {
            modelData[model] = { qty: 0, value: 0, count: 0 };
        }
        modelData[model].qty += row.QUANTITY;
        modelData[model].value += row['TOTAL VALUE_USD'];
        modelData[model].count++;
    });

    const modelSummary: ModelSummary[] = Object.keys(modelData).map(model => ({
        model: model,
        totalQuantity: modelData[model].qty,
        totalValueUSD: modelData[model].value,
        avgUnitPriceUSD: modelData[model].qty > 0 ? modelData[model].value / modelData[model].qty : 0,
    })).sort((a,b) => b.totalQuantity - a.totalQuantity);

    // Supplier Summary by Year
    const supplierSummaryByYear: Record<number, SupplierSummary[]> = {};
    const years = [...new Set(cleanedData.map(d => d.year))].sort();

    years.forEach(year => {
        const yearData = cleanedData.filter(d => d.year === year);
        const yearTotalValue = yearData.reduce((sum, row) => sum + row['TOTAL VALUE_INR'], 0);
        const supplierData: Record<string, { name: string, value: number }> = {};

        yearData.forEach(row => {
            if (!supplierData[row.IEC]) {
                supplierData[row.IEC] = { name: row['IMPORTER NAME'], value: 0 };
            }
            supplierData[row.IEC].value += row['TOTAL VALUE_INR'];
        });

        supplierSummaryByYear[year] = Object.keys(supplierData).map(iec => ({
            iec: iec,
            importerName: supplierData[iec].name,
            totalValueINR: supplierData[iec].value,
            contribution: yearTotalValue > 0 ? supplierData[iec].value / yearTotalValue : 0,
        })).sort((a, b) => b.totalValueINR - a.totalValueINR);
    });


    return { cleanedData, yearlySummary, hsnSummary, topHsnSummary, modelSummary, supplierSummaryByYear, overallDutyPercentage };
};
