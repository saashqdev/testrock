import { RowMedia, Entity, Prisma, RowValue, RowValueMultiple, RowValueRange } from "@prisma/client";
import { update as updateRow } from "@/utils/api/server/RowsApi";
import { prisma } from "@/db/config/prisma/database";
import { PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowValueWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { RowValueDto } from "@/lib/dtos/entities/RowValueDto";
import { RowValueMultipleDto } from "@/lib/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "@/lib/dtos/entities/RowValueRangeDto";

export type RowValueUpdateDto = {
  name: string;
  textValue?: string | undefined;
  numberValue?: number | undefined;
  dateValue?: Date | undefined;
  booleanValue?: boolean | undefined;
  media?: RowMedia[];
  multiple?: RowValueMultipleDto[];
  range?: RowValueRangeDto | undefined;
};
async function update({
  entity,
  row,
  values,
  rowUpdateInput,
  session,
  checkPermissions = true,
  options,
}: {
  entity: Entity & { properties: PropertyWithDetailsDto[] };
  row: { id: string; entityId: string; tenantId: string | null; values: RowValueWithDetailsDto[] };
  values?: RowValueUpdateDto[];
  rowUpdateInput?: Prisma.RowUpdateInput;
  session: { tenantId: string | null; userId?: string } | undefined;
  checkPermissions?: boolean;
  options?: {
    createLog?: boolean;
    createEvent?: boolean;
  };
}) {
  const dynamicProperties: RowValueDto[] = [];
  await Promise.all(
    (values ?? []).map(async (value) => {
      const property = entity.properties.find((i) => i.name === value.name);
      if (property) {
        let existingProperty: RowValue | null = row.values.find((f) => f.propertyId === property?.id) ?? null;
        if (!existingProperty) {
          existingProperty = await prisma.rowValue.findFirstOrThrow({ where: { propertyId: property.id, rowId: row.id } }).catch(() => {
            return null;
          });
        }
        if (!existingProperty) {
          existingProperty = await prisma.rowValue.create({
            data: {
              propertyId: property.id,
              rowId: row.id,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
            },
          });
        }
        dynamicProperties.push({
          id: existingProperty.id,
          property,
          propertyId: property.id,
          textValue: value.textValue,
          numberValue: value.numberValue,
          dateValue: value.dateValue,
          booleanValue: value.booleanValue,
          media: value.media,
          multiple: value.multiple as RowValueMultiple[],
          range: value.range as RowValueRange,
        });
        if (value.textValue !== undefined) {
          existingProperty.textValue = value.textValue;
        }
        if (value.numberValue !== undefined) {
          existingProperty.numberValue = value.numberValue ? new Prisma.Decimal(value.numberValue) : null;
        }
        if (value.dateValue !== undefined) {
          existingProperty.dateValue = value.dateValue;
        }
        if (value.booleanValue !== undefined) {
          existingProperty.booleanValue = value.booleanValue;
        }
      }
    })
  );
  return await updateRow(row.id, {
    entity,
    tenantId: row.tenantId,
    rowValues: {
      dynamicProperties,
    },
    rowUpdateInput,
    userId: session?.userId,
    checkPermissions,
    options,
  });
}

export default {
  update,
};
