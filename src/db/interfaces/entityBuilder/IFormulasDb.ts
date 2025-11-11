import { FormulaWithDetailsDto, CreateFormulaDto } from "@/db/models/entityBuilder/FormulasModel";
import { Formula } from "@prisma/client";
export interface IFormulasDb {
  getAllFormulas(): Promise<FormulaWithDetailsDto[]>;
  getAllFormulasIdsAndNames(): Promise<{ id: string; name: string }[]>;
  getAllFormulasInIds(ids: string[]): Promise<FormulaWithDetailsDto[]>;
  getFormula(id: string): Promise<FormulaWithDetailsDto | null>;
  getFormulaWithLogs(id: string): Promise<FormulaWithDetailsDto | null>;
  createFormula(data: CreateFormulaDto): Promise<Formula>;
  updateFormula(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      resultAs?: string;
      calculationTrigger?: string;
      withLogs?: boolean;
      components?: {
        order: number;
        type: string;
        value: string;
      }[];
    }
  ): Promise<Formula>;
  deleteFormula(id: string): Promise<Formula>;
}
