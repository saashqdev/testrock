import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { ColumnDto } from "@/lib/dtos/data/ColumnDto";
import RowCard from "./RowCard";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import clsx from "clsx";

export default function RenderCard({
  layout,
  item,
  entity,
  columns,
  allEntities,
  routes,
  actions,
  href,
}: {
  layout: "table" | "grid" | "board" | "card";
  item: RowWithDetailsDto;
  entity: EntityWithDetailsDto;
  columns: ColumnDto[];
  allEntities: EntityWithDetailsDto[];
  routes: EntitiesApi.Routes | undefined;
  actions?: (row: RowWithDetailsDto) => { title?: string; href?: string; onClick?: () => void; isLoading?: boolean; render?: React.ReactNode }[];
  href?: string | undefined;
}) {
  return (
    <div className={clsx("shadow-2xs rounded-md border border-border bg-background p-3", href && "hover:border-border hover:shadow-md")}>
      <RowCard layout={layout} item={item} entity={entity} columns={columns} allEntities={allEntities} routes={routes} actions={actions} />
    </div>
  );
}
