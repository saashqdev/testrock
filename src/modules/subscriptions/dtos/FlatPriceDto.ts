export interface FlatPriceDto {
  id: string;
  currency: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  oneTimePrice?: number;
  quarterlyPrice?: number;
  semiAnnualPrice?: number;
}
