// Client-safe version of FormulaHelpers utilities
// This file should NOT import any server-side dependencies

export type FormulaOperatorType =
  | "ADD"
  | "SUBTRACT"
  | "MULTIPLY"
  | "DIVIDE"
  | "CONCAT"
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN_OR_EQUAL"
  | "AND"
  | "OR"
  | "NOT"
  | "DATE_ADD_DAYS";

function getOperatorType(operator: string): FormulaOperatorType {
  switch (operator) {
    case "ADD":
      return "ADD";
    case "SUBTRACT":
      return "SUBTRACT";
    case "MULTIPLY":
      return "MULTIPLY";
    case "DIVIDE":
      return "DIVIDE";
    case "CONCAT":
      return "CONCAT";
    case "EQUALS":
      return "EQUALS";
    case "NOT_EQUALS":
      return "NOT_EQUALS";
    case "GREATER_THAN":
      return "GREATER_THAN";
    case "LESS_THAN":
      return "LESS_THAN";
    case "GREATER_THAN_OR_EQUAL":
      return "GREATER_THAN_OR_EQUAL";
    case "LESS_THAN_OR_EQUAL":
      return "LESS_THAN_OR_EQUAL";
    case "AND":
      return "AND";
    case "OR":
      return "OR";
    case "NOT":
      return "NOT";
    case "DATE_ADD_DAYS":
      return "DATE_ADD_DAYS";
    default:
      return "ADD";
  }
}

function getOperatorSymbol(operator?: string): string {
  switch (getOperatorType(operator ?? "")) {
    case "ADD":
      return "+";
    case "DATE_ADD_DAYS":
      return "+";
    case "SUBTRACT":
      return "-";
    case "MULTIPLY":
      return "*";
    case "DIVIDE":
      return "/";
    case "CONCAT":
      return "&";
    case "EQUALS":
      return "=";
    case "NOT_EQUALS":
      return "!=";
    case "GREATER_THAN":
      return ">";
    case "LESS_THAN":
      return "<";
    case "GREATER_THAN_OR_EQUAL":
      return ">=";
    case "LESS_THAN_OR_EQUAL":
      return "<=";
    case "AND":
      return "AND";
    case "OR":
      return "OR";
    case "NOT":
      return "NOT";
    default:
      return "";
  }
}

export const FormulaHelpersClient = {
  getOperatorSymbol,
  getOperatorType,
};
