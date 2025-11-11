import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto, RowWithValuesDto } from "@/db/models/entityBuilder/RowsModel";
import { FormulaValueType } from "../dtos/FormulaDto";
import { Property } from "@prisma/client";
import RowHelper from "@/lib/helpers/RowHelper";
import { TFunction } from "i18next";

function getRowValue({
  componentName,
  row,
  allEntities,
  t,
}: {
  componentName: string;
  row: { entity: EntityWithDetailsDto; item: RowWithDetailsDto };
  allEntities: EntityWithDetailsDto[];
  t: TFunction;
}): FormulaValueType {
  const { entity, item } = row;
  const parts = componentName.split(".");
  if (parts.length === 0 || parts[0] !== "row") {
    throw new Error(`Invalid component ${componentName} for entity (${entity.name})`);
  }
  const entityName = parts[1];
  const propertyName = parts[2];
  let customFunction: string | null = null;
  if (parts.length > 3) {
    customFunction = parts[3];
  }
  if (parts[1] === entity.name) {
    if (propertyName === "order") {
      return item.order;
    }
  }
  const foundParentEntity = entity.parentEntities.find((i) => i.parent.name === entityName);
  const foundChildEntity = entity.childEntities.find((i) => i.child.name === entityName);
  let property: Property | undefined = entity.properties.find((i) => i.name === propertyName);
  if (property) {
    const value = RowHelper.getPropertyValue({ entity, item, propertyName });
    if (customFunction === "inverse") {
      throw new Error("Inverse not implemented");
    }
    return value;
  }
  // console.log({
  //   propertyName,
  //   foundParentEntity: foundParentEntity?.parent.name,
  //   foundChildEntity: foundChildEntity?.child.name,
  // });
  if (foundParentEntity) {
    const parentRows = item.parentRows.filter((i) => i.relationshipId === foundParentEntity.id);
    const parentEntity = allEntities.find((i) => i.id === foundParentEntity.parent.id);
    return findRelatedRowsValue({ entity: parentEntity!, rows: parentRows.map((f) => f.parent), propertyName });
  } else if (foundChildEntity) {
    const childRows = item.childRows.filter((i) => i.relationshipId === foundChildEntity.id);
    const childEntity = allEntities.find((i) => i.id === foundChildEntity.child.id);
    const value = findRelatedRowsValue({ entity: childEntity!, rows: childRows.map((f) => f.child), propertyName });
    return value;
  }

  if (!property) {
    throw new Error(
      `Invalid component ${componentName} for entity (${entity.name}). Unknown property: ${propertyName} in (${entity.properties
        .map((f) => f.name)
        .join(",")}).`
    );
  }
  throw new Error(
    `Invalid component ${componentName} for entity (${entity.name}), property (${propertyName}), and row ${RowHelper.getTextDescription({ entity, item, t })}`
  );
}

function findRelatedRowsValue({
  entity,
  rows,
  propertyName,
  customFunction,
}: {
  entity: EntityWithDetailsDto & { properties: Property[] };
  rows: RowWithValuesDto[];
  propertyName: string;
  customFunction?: string | null;
}): FormulaValueType {
  if (propertyName === "order") {
    return rows.length > 0 ? rows[0].order : 0;
  }
  const property = entity.properties.find((i) => i.name === propertyName);
  if (!property) {
    throw new Error(`Property ${propertyName} not found on entity ${entity.name}`);
  }
  if (rows.length === 0) {
    return RowHelper.getPropertyDefaultValue(property);
  } else if (rows.length === 1) {
    const value = RowHelper.getPropertyValue({ entity, item: rows[0], propertyName });
    if (customFunction === "inverse") {
      throw new Error("Inverse not implemented");
    }
    return value;
  } else if (!customFunction) {
    throw new Error(`Property ${propertyName} has multiple values but no custom function was specified`);
  }
  throw new Error(`Property ${propertyName} has multiple values but custom function ${customFunction} is not implemented`);
}

export default {
  getRowValue,
};
