import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Loading from "@/components/ui/loaders/Loading";
import { Routes } from "@/utils/api/server/EntitiesApi";
import { GetRowData, GetRelationshipRowsData } from "@/utils/api/server/RowsApi";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { getEntityPermission, getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import RowForm from "../../../components/entities/rows/RowForm";
import RowTags from "../../../components/entities/rows/RowTags";

interface Props {
  url: string;
  onUpdated?: (row: RowWithDetailsDto) => void;
  onDeleted?: () => void;
  allEntities: EntityWithDetailsDto[];
}
export default function RowEditFetcher({ url, onUpdated, allEntities, onDeleted }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  const [data, setData] = useState<{
    rowData?: GetRowData;
    routes?: Routes;
    updatedRow?: GetRowData;
    relationshipRows?: GetRelationshipRowsData;
  }>();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

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

      if (result.rowData && result.routes) {
        setData(result);
      }

      // Don't call onUpdated on initial load, only on explicit updates
      // if (result.updatedRow?.item && onUpdated) {
      //   onUpdated(result.updatedRow.item);
      // }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.updatedRow?.item && onUpdated) {
        onUpdated(result.updatedRow.item);
      }

      // Refresh data after successful submission
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!data?.rowData?.item.id) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("action", "delete");
      formData.set("id", data.rowData.item.id);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error deleting item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {loading && !data ? (
        <Loading small loading />
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : !data?.rowData ? (
        <div>No data</div>
      ) : data ? (
        <div>
          {data.routes && (
            <div className="space-y-2">
              {data.rowData.item.tags.length > 0 && <RowTags items={data.rowData.item.tags} />}
              <RowForm
                allEntities={allEntities}
                entity={data.rowData.entity}
                routes={data.routes}
                item={data.rowData.item}
                editing={true}
                canDelete={getUserHasPermission(appOrAdminData, getEntityPermission(data.rowData.entity, "delete")) && data.rowData.rowPermissions.canDelete}
                canUpdate={getUserHasPermission(appOrAdminData, getEntityPermission(data.rowData.entity, "update")) && data.rowData.rowPermissions.canUpdate}
                onSubmit={onSubmit}
                onDelete={onDelete}
                relationshipRows={data.relationshipRows}
                state={{
                  loading: loading,
                  submitting: submitting,
                }}
                promptFlows={data.rowData.allPromptFlows}
              />
            </div>
          )}
        </div>
      ) : (
        <div>{t("shared.unknownError")}</div>
      )}
    </div>
  );
}
