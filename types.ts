
export interface RawTradeData {
  'S.NO': number;
  IEC: string;
  'IMPORTER NAME': string;
  DATE: Date;
  'HS CODE': string;
  'HSN DESCRIPTION': string;
  'GOODS DESCRIPTION': string;
  QUANTITY: number;
  UQC: string;
  'UNIT PRICE_INR': number;
  'UNIT PRICE_USD': number;
  'TOTAL VALUE_INR': number;
  'TOTAL VALUE_USD': number;
  'DUTY PAID_INR': number;
  'DUTY %': number;
  LOCATION: string;
  COUNTRY: string;
}

export interface CleanedTradeData extends RawTradeData {
  year: number;
  'Grand Total_INR': number;
  'Model Name/Number': string;
  Capacity: string;
  'Item Qty': number | null;
  'Unit Price_USD (Parsed)': number | null;
  'Main Category': string;
  'Sub-category': string;
  isExceptionalDuty: boolean;
  'Per Unit Cost With Duty_INR': number;
}

export interface YearlySummary {
  year: number;
  totalValueINR: number;
  dutyPaidINR: number;
  grandTotalINR: number;
  yoyGrowth?: number;
}

export interface HsnSummary {
  hsnCode: string;
  hsnDescription: string;
  totalValueINR: number;
  dutyPaidINR: number;
  grandTotalINR: number;
  contribution: number;
}

export interface ModelSummary {
  model: string;
  totalQuantity: number;
  totalValueUSD: number;
  avgUnitPriceUSD: number;
}

export interface SupplierSummary {
  iec: string;
  importerName: string;
  totalValueINR: number;
  contribution: number;
}

export interface AnalysisData {
    cleanedData: CleanedTradeData[];
    yearlySummary: YearlySummary[];
    hsnSummary: HsnSummary[];
    topHsnSummary: HsnSummary[];
    modelSummary: ModelSummary[];
    supplierSummaryByYear: Record<number, SupplierSummary[]>;
    overallDutyPercentage: number;
}
