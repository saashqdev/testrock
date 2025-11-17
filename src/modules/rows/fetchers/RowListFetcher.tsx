import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputFilters from "@/components/ui/input/InputFilters";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { Routes } from "@/utils/api/server/EntitiesApi";
import { GetRowsData } from "@/utils/api/server/RowsApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import RowNewFetcher from "./RowNewFetcher";
import RowsList from "@/components/entities/rows/RowsList";
import { RowDisplayDefaultProperty } from "@/lib/helpers/PropertyHelper";
import Loading from "@/components/ui/loaders/Loading";

interface Props {
  currentView: EntityViewsWithDetailsDto | null;
  listUrl: string;
  newUrl: string;
  parentEntity?: EntityWithDetailsDto;
  onSelected: (rows: RowWithDetailsDto[]) => void;
  multipleSelection?: boolean;
  allEntities: EntityWithDetailsDto[];
}
export default function RowListFetcher({ currentView, listUrl, newUrl, parentEntity, onSelected, multipleSelection, allEntities }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<{ rowsData: GetRowsData; routes: Routes }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<RowWithDetailsDto[]>([]);
  const [selectedRows, setSelectedRows] = useState<RowWithDetailsDto[]>([]);
  const [searchParams] = useSearchParams();

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
        // DON'T update selectedRows here - let user selections persist
        // The only time we need to update is if a selected row no longer exists in the new data
        // But that can cause issues, so we'll just leave selectedRows alone
        // User selections are managed entirely by onRowsSelected callback
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed now

  // Combine the two useEffects to avoid double fetching
  useEffect(() => {
    // Extract entity slug and tenant from listUrl path
    // listUrl format: /app/{tenant}/{entity} or /admin/entities/{entity}/no-code/{entity}
    let entitySlug = "";
    let tenantSlug = "";
    
    const listUrlMatch = listUrl.match(/\/app\/([^\/]+)\/([^\/\?]+)|\/admin\/entities\/([^\/]+)/);
    if (listUrlMatch) {
      tenantSlug = listUrlMatch[1] || "";
      entitySlug = listUrlMatch[2] || listUrlMatch[3] || "";
    }
    
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (entitySlug) {
      params.set("entity", entitySlug);
    }
    if (tenantSlug) {
      params.set("tenant", tenantSlug);
    }
    if (currentView) {
      params.set("v", currentView.name);
    }
    
    const url = `/api/rows/fetch?${params.toString()}`;
    fetchData(url);
  }, [searchParams, currentView, listUrl, fetchData]);

  const onRowsSelected = useCallback((rows: RowWithDetailsDto[]) => {
    setSelectedRows(rows);
  }, []);

  const onCreated = useCallback((row: RowWithDetailsDto) => {
    setRows((prevRows) => [row, ...prevRows]);
    setSelectedRows((prevSelected) => [row, ...prevSelected]);
    setAdding(false);
  }, []);

  const onConfirm = useCallback((rows: RowWithDetailsDto[]) => {
    onSelected(rows);
  }, [onSelected]);

  return (
    <div>
      {loading && !data ? (
        <Loading small loading />
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : !data?.rowsData?.entity ? (
        <div className="relative block w-full cursor-not-allowed rounded-lg border-2 border-dashed border-border p-4 text-center">{t("shared.loading")}...</div>
      ) : !data?.rowsData ? (
        <div>No data</div>
      ) : data?.rowsData ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            {/* <div className="text-lg font-bold text-foreground">{t(data.rowsData?.entity.titlePlural)}</div> */}
            <ButtonPrimary type="button" onClick={() => onConfirm(selectedRows)} disabled={selectedRows.length > 1 && !multipleSelection}>
              {selectedRows.length === 1 ? (
                <div className="flex space-x-1">
                  <div>{t("shared.select")} 1</div>
                  <div className="lowercase">{t(data.rowsData?.entity.title)}</div>
                </div>
              ) : (
                <div className="flex space-x-1">
                  <div>
                    {t("shared.select")} {selectedRows.length}
                  </div>
                  <div className="lowercase">{t(data.rowsData?.entity.titlePlural)}</div>
                </div>
              )}
            </ButtonPrimary>
            <div className="flex space-x-2">
              <InputFilters filters={EntityHelper.getFilters({ t, entity: data.rowsData.entity })} />
              <ButtonSecondary type="button" onClick={() => setAdding(true)}>
                +
                {/* {t("shared.new")}
              <span className="ml-1 lowercase">{t(data.rowsData?.entity.title)}</span> */}
              </ButtonSecondary>
            </div>
          </div>
          <RowsList
            view={(currentView?.layout ?? "table") as "table" | "board" | "grid" | "card"}
            currentView={currentView}
            entity={data.rowsData.entity}
            items={rows}
            pagination={data.rowsData.pagination}
            selectedRows={selectedRows}
            onSelected={onRowsSelected}
            readOnly={true}
            // routes={data.routes}
            ignoreColumns={[RowDisplayDefaultProperty.FOLIO]}
          />
        </div>
      ) : (
        <div>{t("shared.unknownError")}</div>
      )}
      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data?.rowsData?.entity.title ?? "")}
        className="max-w-md"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <RowNewFetcher url={newUrl} parentEntity={parentEntity} onCreated={onCreated} allEntities={allEntities} />
      </SlideOverWideEmpty>
    </div>
  );
}
