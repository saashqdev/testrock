import { Params } from "@/types";
import { BlockVariableDto } from "./BlockVariableDto";

export function getValue({ request, params, variable }: { request: Request; params: Params; variable?: BlockVariableDto }): string | null {
  if (!variable) {
    throw Error("[BlockVariableService.getValue()] Unknown variable");
  }
  let value: string | null = null;
  if (variable.type === "manual") {
    value = variable?.value ?? null;
  } else if (variable.type === "param" && variable.param) {
    const paramValue = params[variable.param];
    value = Array.isArray(paramValue) ? paramValue[0] ?? null : paramValue ?? null;
  } else if (variable.type === "query") {
    const searchParams = new URL(request.url).searchParams;
    value = searchParams.get(variable.query || "")?.toString() ?? null;
  }
  if (variable?.required && !value) {
    throw Error(`Variable is required`);
  }
  return value;
}

// export function getValues({ request, params, block }: { request: Request; params: Params; block: PageBlockDto }): Record<string, string | null> {
//   if (!block.variables) {
//     return {};
//   }
//   const values: { [key: string]: string | null } = {};
//   Object.keys(block.variables).forEach((key) => {
//     values[key] = getValue({ request, params, variable: block.variables[key] });
//     if (values[key] === null && block.variables[key]?.required) {
//       throw Error(`Variable "${key}" is required`);
//     }
//   });
//   return values;
// }

