"use client";

import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import { useEffect, useState } from "react";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import RowHelper from "@/lib/helpers/RowHelper";
import clsx from "clsx";
import { Property } from "@prisma/client";
import Link from "next/link";

interface Props {
  entity: EntityWithDetailsDto;
  items: RowWithDetailsDto[];
  className?: string;
}
export default function RowsKanban({ entity, items, className }: Props) {
  const [columns, setColumns] = useState<{ name: string; title: string; color?: Colors }[]>([]);
  const [columnsProperty, setColumnsProperty] = useState<Property>();

  useEffect(() => {
    const optionsField = entity.properties.find((f) => [PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(f.type));
    if (optionsField) {
      setColumns(
        optionsField.options
          .sort((a, b) => a.order - b.order)
          .map((option) => {
            return {
              name: option.value,
              title: option.value,
              color: Colors.BLUE,
            };
          })
      );
    }
    setColumnsProperty(optionsField);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getItems(columnName: string) {
    return items.filter((f) => f.values.find((f) => f.propertyId === columnsProperty?.id && f.textValue === columnName));
  }
  return (
    <div className={clsx(className, "flex space-x-4 overflow-x-auto")}>
      {columns.map((column) => {
        return (
          <div key={column.name} className="shadow-2xs h-96 w-64 shrink-0 overflow-y-auto rounded-md border border-border bg-secondary p-2 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  {column.color && (
                    <div>
                      <ColorBadge color={column.color} />
                    </div>
                  )}
                  <div>{column.title}</div>
                </div>
                {/* <button type="button" onClick={onNew(column.name)}>
                  <PlusIcon className="h-3 w-3" />
                </button> */}
              </div>
              {getItems(column.name).map((item) => {
                return (
                  <div key={item.id} className="shadow-2xs group rounded-md border border-border bg-background p-2 hover:bg-secondary">
                    <Link href={item.id} className="space-y-0.5 text-xs">
                      {entity.properties
                        .filter((f) => !f.isDefault && f.id !== columnsProperty?.id)
                        .map((property, idxProp) => {
                          return (
                            <div key={property.name}>
                              <span className={clsx(idxProp === 0 && "font-bold")}>{RowHelper.getCellValue({ entity, item, property })}</span>
                            </div>
                          );
                        })}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
