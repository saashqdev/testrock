import { FormulaLog, FormulaComponentLog } from "@prisma/client";

export type FormulaLogsModel = {
  id: string;
  formulaId: string;
  userId: string;
  action: "create" | "update" | "delete";
  timestamp: Date;
  details: string; // JSON string containing details of the action
};

export type FormulaLogWithDetailsDto = FormulaLog & {
  formula: { id: string; name: string };
  user: { id: string; email: string } | null;
  tenant: { id: string; name: string } | null;
  components: FormulaComponentLog[];
};
