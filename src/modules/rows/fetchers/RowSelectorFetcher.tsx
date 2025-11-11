import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { RowsApi } from "@/utils/api/server/RowsApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import RowNewFetcher from "./RowNewFetcher";
import InputSelector from "@/components/ui/input/InputSelector";
import RowModel from "../repositories/RowModel";

interface Props {
  entity: EntityWithDetailsDto;
  // listUrl: string;
  // newUrl: string;
  routes: EntitiesApi.Routes;
  allEntities: EntityWithDetailsDto[];
  initial?: string;
  onSelected: (row: RowWithDetailsDto) => void;
  onClear?: () => void;
  className?: string;
}
export default function RowSelectorFetcher({ entity, routes, allEntities, initial, onSelected, onClear, className }: Props) {
  const { t } = useTranslation();

  const listUrl = EntityHelper.getRoutes({ routes, entity })?.list ?? "";
  const newUrl = EntityHelper.getRoutes({ routes, entity })?.new ?? "";

  const [selected, setSelected] = useState<string | null>(initial ?? null);
  const [data, setData] = useState<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<RowWithDetailsDto[]>([]);

  const fetchData = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

      if (result.rowsData) {
        setRows(result.rowsData.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const item = rows.find((f) => f.id === selected);
    if (item && item.id !== initial) {
      onSelected(item);
    }
    if (selected === "{new}") {
      setAdding(true);
      // setSelected(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (listUrl) {
      fetchData(listUrl + `?view=null&pageSize=-1`);
    }
  }, [listUrl, fetchData]);

  function onCreated(row: RowWithDetailsDto) {
    setRows([row, ...rows]);
    setSelected(row.id);
    setAdding(false);
  }

  return (
    <div className={className}>
      <InputSelector
        title={t(entity.title)}
        disabled={!data}
        isLoading={loading}
        options={[
          {
            value: "{new}",
            name: ` - ${t("shared.add")} ${t(entity.title)} - `,
          },
          ...(rows.map((f) => {
            const model = new RowModel(f);
            return {
              value: model.row.id,
              name: model.toString(),
            };
          }) ?? []),
        ]}
        value={selected ?? undefined}
        setValue={(e) => setSelected(e?.toString() ?? "")}
        hint={
          <>
            {onClear && selected && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => {
                  setSelected(null);
                  onClear();
                }}
              >
                {t("shared.clear")}
              </button>
            )}
          </>
        }
      />

      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data?.rowsData?.entity.title ?? "")}
        className="max-w-md"
        open={adding}
        onClose={() => {
          setAdding(false);
          if (selected === "{new}") {
            setSelected(null);
          }
        }}
      >
        <RowNewFetcher url={newUrl} parentEntity={entity} onCreated={onCreated} allEntities={allEntities} />
      </SlideOverWideEmpty>
    </div>
  );
}
