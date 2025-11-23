import { useEffect, useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import CheckPlanFeatureLimit from "@/components/core/settings/subscription/CheckPlanFeatureLimit";
import Loading from "@/components/ui/loaders/Loading";
import { GetEntityData, Routes } from "@/utils/api/server/EntitiesApi";
import { GetRelationshipRowsData } from "@/utils/api/server/RowsApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowForm from "../../../components/entities/rows/RowForm";

interface Props {
  url: string;
  parentEntity?: EntityWithDetailsDto;
  onCreated?: (row: RowWithDetailsDto) => void;
  allEntities: EntityWithDetailsDto[];
  customSearchParams?: URLSearchParams;
  children?: React.ReactNode;
  // onSelected: (entity: EntityWithDetails, item: RowWithDetails) => void;
}
function RowNewFetcher({ url, parentEntity, onCreated, allEntities, customSearchParams, children }: Props) {
  const { t } = useTranslation();

  const [data, setData] = useState<{
    newRow?: RowWithDetailsDto;
    entityData?: GetEntityData;
    routes?: Routes;
    relationshipRows?: GetRelationshipRowsData;
  }>();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedRowId, setLastCreatedRowId] = useState<string | null>(null);

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
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    setLastCreatedRowId(null);
  }, [fetchData]);

  useEffect(() => {
    // Only call onCreated if we have a new row and haven't already notified for this row ID
    if (data?.newRow && onCreated && data.newRow.id !== lastCreatedRowId) {
      onCreated(data.newRow);
      setLastCreatedRowId(data.newRow.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.newRow?.id]);

  const onSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);

    try {
      console.log("[RowNewFetcher] Submitting to:", url);
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      console.log("[RowNewFetcher] Response status:", response.status);
      console.log("[RowNewFetcher] Response content-type:", response.headers.get("content-type"));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            console.error("[RowNewFetcher] Error response JSON:", errorData);
            errorMessage = errorData.error || errorMessage;
          } else {
            const text = await response.text();
            console.error("[RowNewFetcher] Error response text:", text.substring(0, 500));
            errorMessage = text.substring(0, 200) || errorMessage;
          }
        } catch (parseError) {
          console.error("[RowNewFetcher] Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[RowNewFetcher] Expected JSON but got:", contentType);
        console.error("[RowNewFetcher] Response body:", text.substring(0, 200));
        throw new Error(`Expected JSON response but got ${contentType || "unknown"}`);
      }

      const result = await response.json();
      setData(result);
      // Note: onCreated will be called by the useEffect when data.newRow changes
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error submitting form:", err);
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
      ) : !data?.entityData ? (
        <div>No data</div>
      ) : data ? (
        <CheckPlanFeatureLimit item={data.entityData.featureUsageEntity}>
          {data.routes && (
            <RowForm
              entity={data.entityData.entity}
              routes={data.routes}
              parentEntity={parentEntity}
              onSubmit={onSubmit}
              onCreatedRedirect={undefined}
              allEntities={allEntities}
              relationshipRows={data.relationshipRows}
              state={{
                loading: loading,
                submitting: submitting,
              }}
              customSearchParams={customSearchParams}
            >
              {children}
            </RowForm>
          )}
        </CheckPlanFeatureLimit>
      ) : (
        <div>{t("shared.unknownError")}</div>
      )}
    </div>
  );
}

// Memoize to prevent re-renders when parent re-renders
export default memo(RowNewFetcher, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.url === nextProps.url &&
    prevProps.parentEntity?.id === nextProps.parentEntity?.id &&
    prevProps.onCreated === nextProps.onCreated &&
    prevProps.allEntities === nextProps.allEntities
  );
});
