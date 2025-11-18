"use client";

import RowsList from "@/components/entities/rows/RowsList";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";

export default function AdminEntityRowsList({
  entity,
  items,
  pagination,
}: {
  entity: EntityWithDetailsDto;
  items: RowWithDetailsDto[];
  pagination: PaginationDto;
}) {
  return (
    <RowsList
      view="table"
      entity={entity}
      items={items}
      pagination={pagination}
      leftHeaders={[
        {
          name: "object",
          title: "Object",
          value: (item) => item,
          formattedValue: (item) => (
            <div>
              <ShowPayloadModalButton title="Details" description={"Details"} payload={JSON.stringify(item)} />
            </div>
          ),
        },
      ]}
    />
  );
}
