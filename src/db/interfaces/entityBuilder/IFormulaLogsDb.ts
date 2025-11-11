import { FormulaLogWithDetailsDto } from "@/db/models/entityBuilder/FormulaLogsModel";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
export interface IFormulaLogsDb {
  getFormulaLogs({
    id,
    pagination,
    filters,
  }: {
    id: string | undefined;
    pagination: {
      pageSize: number;
      page: number;
    };
    filters: FiltersDto;
  }): Promise<{
    items: FormulaLogWithDetailsDto[];
    total: number;
  }>;
  countLogs(ids: string[]): Promise<
    {
      formulaId: string;
      count: number;
    }[]
  >;
  createFormulaLog(data: {
    formulaId: string;
    userId: string | null;
    tenantId: string | null;
    originalTrigger: string;
    triggeredBy: string;
    expression: string;
    result: string;
    error: string | null;
    rowValueId: string | null;
    components: {
      order: number;
      type: string;
      value: string;
      rowId: string | null;
    }[];
  }): Promise<{
    id: string;
    result: string;
    createdAt: Date;
    formulaId: string;
    userId: string | null;
    tenantId: string | null;
    originalTrigger: string | null;
    triggeredBy: string;
    expression: string;
    duration: number;
    error: string | null;
    rowValueId: string | null;
  }>;
  updateFormulaLog(
    id: string,
    data: {
      duration: number;
      result: string;
      error: string | null;
    }
  ): Promise<{
    result: string;
    id: string;
    createdAt: Date;
    formulaId: string;
    userId: string | null;
    tenantId: string | null;
    originalTrigger: string | null;
    triggeredBy: string;
    expression: string;
    duration: number;
    error: string | null;
    rowValueId: string | null;
  }>;
}
