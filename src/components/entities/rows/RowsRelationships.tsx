"use client";

import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import Kanban from "@/components/ui/lists/Kanban";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowHelper from "@/lib/helpers/RowHelper";

// type EntityWithRows = {
//   entity: EntityWithDetails;
//   rows: RowWithDetails[];
// };
export default function RowsRelationships({ entities }: { entities: string[] }) {
  return (
    <div className="flex overflow-hidden overflow-x-auto">
      {entities.map((entity) => (
        <EntityRowsRelationships className="w-full" key={entity} entity={entity} />
      ))}
    </div>
  );
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function EntityRowsRelationships({ entity, className, withTitle }: { entity: string; className?: string; withTitle?: boolean }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const router = useRouter();

  // Use SWR for data fetching
  const { data, error, isLoading } = useSWR<{ entity: EntityWithDetailsDto; items: RowWithDetailsDto[] }>(
    `/api/v2/entities/${entity}/rows?${searchParams}`,
    fetcher
  );

  function isSelected(item: RowWithDetailsDto) {
    return newSearchParams.getAll(`${entity}[id]`).includes(item.id);
  }

  if (error) {
    return (
      <div className={clsx(className, "flex items-center justify-center p-4 text-muted-foreground")}>
        <span>Error loading {entity} data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={clsx(className, "flex items-center justify-center p-4 text-muted-foreground")}>
        <span>Loading {entity}...</span>
      </div>
    );
  }

  return (
    <div className={clsx(className)}>
      {data?.entity && (
        <Kanban
          withTitle={withTitle}
          columns={[
            {
              name: "entity",
              title: t(data?.entity.titlePlural ?? ""),
              items: data?.items ?? [],
              card: (item) => (
                <div className="shadow-2xs group w-full truncate rounded-md border border-border bg-background p-3 text-left hover:bg-secondary">
                  <div className="flex items-center justify-between space-x-2">
                    <button
                      className="grow truncate text-left"
                      type="button"
                      onClick={() => {
                        if (isSelected(item)) {
                          const rows = newSearchParams.getAll(`${entity}[id]`).filter((id) => id !== item.id);
                          newSearchParams.delete(`${entity}[id]`);
                          for (const row of rows) newSearchParams.append(`${entity}[id]`, row);
                        } else {
                          newSearchParams.append(`${entity}[id]`, item.id);
                        }
                        router.push(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
                      }}
                    >
                      <div>{RowHelper.getTextDescription({ entity: data.entity!, item, t })}</div>
                    </button>
                    <div className="w-4 shrink-0">{isSelected(item) ? <CheckIcon className="h-4 w-4 text-muted-foreground" /> : null}</div>
                    {/* <button type="button" onClick={() => alert("edit: " + item.id)}>
                      Edit
                    </button> */}
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
