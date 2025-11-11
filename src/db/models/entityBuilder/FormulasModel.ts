import { Entity, Property, Formula, FormulaComponent } from "@prisma/client";

export type FormulasModel = {
  id: string;
  expression: string;
  description?: string;
  isActive: boolean;
};

export type FormulaWithDetailsDto = Formula & {
  components: FormulaComponent[];
  inProperties: (Property & { entity: Entity })[];
};

export type CreateFormulaDto = {
  name: string;
  description: string | null;
  resultAs: string;
  calculationTrigger: string;
  withLogs: boolean;
  components: {
    order: number;
    type: string;
    value: string;
  }[];
};
