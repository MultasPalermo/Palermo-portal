export interface ColumnDef {
  key: string;
  header: string;
  type: 'text' | 'actions' | 'chip' | 'date' | 'number' | 'currency';
  dateFormat?: string;
  currencyCode?: string;
  currencyDisplay?: 'symbol' | 'code' | 'symbol-narrow';
}