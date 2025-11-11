import RowValueService, { RowValueUpdateDto } from "@/lib/helpers/server/RowValueService";
import { FormulaWithDetailsDto } from "@/db/models/entityBuilder/FormulasModel";
import { FormulaCalculationTriggerType, FormulaDto, FormulaEndResult, FormulaValueType } from "../../dtos/FormulaDto";
import { FormulaVariableValueDto } from "../../dtos/FormulaVariableValueDto";
import FormulaHelpers from "../../utils/FormulaHelpers";
import FormulaCalculator from "../../utils/FormulaCalculator";
import FormulaRowService from "../FormulaRowService";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowHelper from "@/lib/helpers/RowHelper";
import { FormulaLog } from "@prisma/client";
import { TFunction } from "i18next";
import { db } from "@/db";

async function calculate({
  formula,
  variables,
  allEntities,
  session,
  originalTrigger,
  triggeredBy,
  rowValueId,
  isDebugging,
  t,
}: {
  formula: FormulaWithDetailsDto;
  variables: FormulaVariableValueDto[];
  allEntities: EntityWithDetailsDto[];
  session: { tenantId?: string | null; userId?: string } | undefined;
  originalTrigger: string;
  triggeredBy: string;
  rowValueId?: string | null;
  isDebugging?: boolean;
  t: TFunction;
}): Promise<FormulaEndResult> {
  const formulaDto = FormulaHelpers.getFormulaDto(formula);

  const { values, usedRows } = getTranslatedValues(formulaDto, variables, allEntities, t);
  // eslint-disable-next-line no-console
  console.log("[FormulaService.calculate] variable values", { values });
  const expression: { order: number; type: string; value: string; rowId: string | null }[] = [];
  formulaDto.components
    .sort((a, b) => a.order - b.order)
    .forEach((component) => {
      let value = "";
      if (component.type === "variable") {
        if (Object.keys(values).includes(component.value)) {
          value = FormulaHelpers.getValueAsString(values[component.value]);
        } else {
          value = "[Unset]";
        }
      } else if (component.type === "operator") {
        value = FormulaHelpers.getOperatorSymbol(component.value);
      } else if (component.type === "parenthesis") {
        value = FormulaHelpers.getParenthesisType(component.value);
      } else {
        value = `[Unknown component #${component.order}]`;
      }
      let rowId: string | null = null;
      if (Object.keys(usedRows).includes(component.value ?? "")) {
        rowId = usedRows[component.value ?? ""].id;
      }
      expression.push({ order: component.order, type: component.type, value, rowId });
    });

  // eslint-disable-next-line no-console
  console.log({ components: formulaDto.components, values, variables });

  let formulaLog: FormulaLog | null = null;

  if (!isDebugging && formulaDto.id && formulaDto.withLogs) {
    formulaLog = await db.formulaLogs.createFormulaLog({
      formulaId: formulaDto.id,
      userId: session?.userId ?? null,
      tenantId: session?.tenantId ?? null,
      originalTrigger,
      triggeredBy,
      expression: expression.map((e) => e.value).join(" "),
      result: "",
      error: null,
      components: expression.map((e) => ({ order: e.order, type: e.type, value: e.value, rowId: e.rowId })),
      rowValueId: rowValueId ?? null,
    });
  }

  const startTime = performance.now();
  try {
    const result = FormulaCalculator.calculateFormula(formulaDto, values);
    const endTime = performance.now();
    const duration = endTime - startTime;
    if (formulaLog) {
      await db.formulaLogs.updateFormulaLog(formulaLog.id, {
        duration,
        result: FormulaHelpers.getValueAsString(result),
        error: null,
      });
    }
    return result;
  } catch (e: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    if (formulaLog) {
      await db.formulaLogs.updateFormulaLog(formulaLog.id, {
        duration,
        result: "",
        error: e.message,
      });
    }
    throw e;
  }
}

async function trigger({
  trigger,
  entity,
  rows,
  session,
  t,
}: {
  trigger: FormulaCalculationTriggerType;
  entity: EntityWithDetailsDto;
  rows: RowWithDetailsDto[];
  session: { tenantId?: string | null; userId?: string } | undefined;
  t: TFunction;
}) {
  const formulaProperties = entity.properties.filter((f) => f.formulaId);
  if (formulaProperties.length === 0) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log("[FormulaService.trigger]", { trigger, entity: entity.name, rows: rows.length });

  const promises = formulaProperties.map(async (property) => {
    return triggerRowProperty({ trigger, entity, rows, session, property, t }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[FormulaService] Error", {
        trigger,
        property: property.name,
        error: e.message,
      });
      return null;
    });
  });

  return await Promise.all(promises);
  // run in parallel
}

async function triggerRowProperty({
  trigger,
  entity,
  rows,
  session,
  property,
  t,
}: {
  trigger: FormulaCalculationTriggerType;
  entity: EntityWithDetailsDto;
  rows: RowWithDetailsDto[];
  session: { tenantId?: string | null; userId?: string } | undefined;
  property: PropertyWithDetailsDto;
  t: TFunction;
}) {
  if (rows.length === 0 || !property.formulaId) {
    return;
  }
  const formula = await db.formulas.getFormula(property.formulaId);
  if (!formula) {
    return;
  }

  const formulaTrigger = FormulaHelpers.getCalculationTrigger(formula.calculationTrigger);
  const allEntities = await db.entities.getAllEntities(null);
  // eslint-disable-next-line no-console

  return await Promise.all(
    rows.map(async (row) => {
      const resultAs = FormulaHelpers.getResultAs(formula.resultAs);

      let triggeredBy = trigger;
      let willCalculate = formulaTrigger === trigger;
      if (!willCalculate) {
        if (formulaTrigger === "ALWAYS") {
          willCalculate = true;
          triggeredBy = "ALWAYS";
        } else if (formulaTrigger === "IF_UNSET") {
          const rowValue = RowHelper.getPropertyValue({
            entity,
            item: row,
            property,
          });
          willCalculate = rowValue === null || rowValue === undefined;
          if (willCalculate) {
            triggeredBy = "IF_UNSET";
          }
        }
      }
      // eslint-disable-next-line no-console
      console.log({ row: row.id, formulaName: formula.name, currentTrigger: trigger, formulaTrigger, willCalculate });

      if (!willCalculate) {
        return;
      }

      let rowValueId = row.values.find((v) => v.propertyId === property.id)?.id ?? null;
      const variables: FormulaVariableValueDto[] = [{ row: { entity, item: row } }];
      const value = await calculate({
        formula,
        variables,
        allEntities,
        session,
        originalTrigger: trigger,
        triggeredBy,
        rowValueId,
        t,
      });
      // eslint-disable-next-line no-console
      console.log(`[FormulaService] Result for row ${RowHelper.getTextDescription({ entity, item: row, t })}`, {
        value,
      });
      let valueToUpdate: RowValueUpdateDto | null = null;
      switch (resultAs) {
        case "number":
          valueToUpdate = { name: property.name, numberValue: value as number };
          break;
        case "string":
          valueToUpdate = { name: property.name, textValue: value as string };
          break;
        case "boolean":
          valueToUpdate = { name: property.name, booleanValue: value as boolean };
          break;
        case "date":
          valueToUpdate = { name: property.name, dateValue: value as Date };
          break;
        default:
          break;
      }
      if (valueToUpdate) {
        await RowValueService.update({
          values: [valueToUpdate],
          session: { tenantId: session?.tenantId ?? row.tenantId, userId: session?.userId },
          entity,
          row,
          checkPermissions: false,
        });
      }
    })
  );
}

function getTranslatedValues(
  formula: FormulaDto,
  values: FormulaVariableValueDto[],
  allEntities: EntityWithDetailsDto[],
  t: TFunction
): {
  values: Record<string, FormulaValueType>;
  usedRows: Record<string, RowWithDetailsDto>;
} {
  const variables: Record<string, FormulaValueType> = {};
  const usedRows: Record<string, RowWithDetailsDto> = {};
  formula.components
    .filter((c) => c.type === "variable" || c.type === "value")
    .forEach((component) => {
      const componentName = component.value ?? "";
      if (component.type === "value") {
        variables[componentName] = component.value;
        return;
      }
      const plainValue = values.find((v) => v.plain?.variable === componentName)?.plain;
      if (plainValue) {
        if (plainValue?.textValue !== undefined) {
          // if value.textValue is number an formula returnsAsNumber
          if (formula.resultAs === "number") {
            variables[componentName] = Number(plainValue.textValue);
          } else {
            variables[componentName] = plainValue.textValue;
          }
        } else if (plainValue?.numberValue !== undefined) {
          variables[componentName] = plainValue.numberValue;
        } else if (plainValue?.dateValue !== undefined) {
          variables[componentName] = plainValue.dateValue;
        } else if (plainValue?.booleanValue !== undefined) {
          variables[componentName] = plainValue.booleanValue;
        }
      } else if (componentName.startsWith("row.")) {
        const rowValue = values.find((v) => v.row);
        if (rowValue?.row === undefined) {
          throw new Error(`Row required for component ${componentName}`);
        }
        if (rowValue.row.item) {
          usedRows[componentName] = rowValue.row.item;
        }
        variables[componentName] = FormulaRowService.getRowValue({ componentName, row: rowValue.row, allEntities, t });
      } else if (componentName?.startsWith("user.")) {
        throw new Error("User variables are not supported yet");
      } else if (componentName?.startsWith("tenant.")) {
        throw new Error("Tenant variables are not supported yet");
      }
      // else {
      //   throw new Error(`Formula component value is unset: ${componentName}`);
      // }
    });
  return { values: variables, usedRows };
}

export default {
  calculate,
  trigger,
  getTranslatedValues,
};
