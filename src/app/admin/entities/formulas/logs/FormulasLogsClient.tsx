"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputFilters from "@/components/ui/input/InputFilters";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { FilterableValueLink } from "@/components/ui/links/FilterableValueLink";
import TableSimple from "@/components/ui/tables/TableSimple";
import { FormulaLogWithDetailsDto } from "@/db/models/entityBuilder/FormulaLogsModel";
import SpeedBadge from "@/modules/metrics/components/SpeedBadge";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import DateUtils from "@/lib/shared/DateUtils";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { deleteFormulaLogs } from "./actions";

type FormulaLogsClientProps = {
  data: {
    title: string;
    items: FormulaLogWithDetailsDto[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
    allEntities: EntityWithDetailsDto[];
  };
};

export default function FormulaLogsClient({ data }: FormulaLogsClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();

  const [selectedRows, setSelectedRows] = useState<FormulaLogWithDetailsDto[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete(ids: string[]) {
    try {
      setIsDeleting(true);
      await deleteFormulaLogs(ids);
      setSelectedRows([]);
      router.refresh();
    } catch (error) {
      console.error("Error deleting formula logs:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <EditPageLayout
      title={``}
      menu={[
        {
          title: "Formulas",
          routePath: "/admin/entities/formulas",
        },
        {
          title: "Logs",
          routePath: "/admin/entities/formulas/logs",
        },
      ]}
    >
      <div className="space-y-2">
        <div className="flex justify-between space-x-2">
          <h2 className="text-xl font-semibold">Formula Logs</h2>
          <div className="flex items-center space-x-2">
            {selectedRows.length > 0 && (
              <ButtonSecondary
                destructive
                disabled={!getUserHasPermission(appOrAdminData, "admin.formulas.delete") || isDeleting}
                onClick={() => {
                  onDelete(selectedRows.map((x) => x.id));
                }}
              >
                {isDeleting ? "Deleting..." : `Delete ${selectedRows.length}`}
              </ButtonSecondary>
            )}
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div>
        </div>
        <TableSimple
          selectedRows={selectedRows}
          onSelected={setSelectedRows}
          pagination={data.pagination}
          items={data.items}
          headers={[
            {
              name: "formula",
              title: "Formula",
              value: (item) => item.formula.name,
            },
            {
              name: "status",
              title: "Status",
              value: (item) => (
                <div>
                  {item.error ? (
                    <FilterableValueLink name="status" value="error">
                      <SimpleBadge title="Error" color={Colors.RED} />
                    </FilterableValueLink>
                  ) : item.result.length === 0 ? (
                    <FilterableValueLink name="status" value="empty">
                      <SimpleBadge title="No result" color={Colors.YELLOW} />
                    </FilterableValueLink>
                  ) : item.result.length > 0 ? (
                    <FilterableValueLink name="status" value="success">
                      <SimpleBadge title="Success" color={Colors.GREEN} />
                    </FilterableValueLink>
                  ) : null}
                </div>
              ),
            },
            {
              name: "result",
              title: "Result",
              value: (item) => <div>{item.result}</div>,
            },
            {
              name: "originalTrigger",
              title: "Original Trigger",
              value: (item) => <FilterableValueLink name="originalTrigger" value={item.originalTrigger ?? ""} />,
            },
            {
              name: "triggeredBy",
              title: "Triggered By",
              value: (item) => <FilterableValueLink name="triggeredBy" value={item.triggeredBy} />,
            },
            {
              name: "expression",
              title: "Expression",
              value: (item) => <div>{item.expression}</div>,
            },
            {
              name: "components",
              title: "Components",
              value: (item) => (
                <ShowPayloadModalButton
                  title="Components"
                  description={item.components.length + " components"}
                  payload={JSON.stringify(
                    {
                      components: item.components
                        .sort((a, b) => a.order - b.order)
                        .map((f) => ({ order: f.order ?? undefined, type: f.type, value: f.value, rowId: f.rowId ?? undefined })),
                    },
                    null,
                    2
                  )}
                />
              ),
            },
            {
              name: "error",
              title: "Error",
              value: (item) => <div className="text-red-500">{item.error}</div>,
            },
            {
              name: "speed",
              title: "Speed",
              value: (item) => <SpeedBadge duration={item.duration} />,
            },
            {
              name: "duration",
              title: "Duration",
              value: (item) => <div>{item.duration.toFixed(3)} ms</div>,
            },
            {
              name: "usedRows",
              title: "Used Rows",
              value: (item) => (
                <div className="flex flex-col">
                  {item.components
                    .filter((f) => f.rowId)
                    .filter((f, index, self) => self.findIndex((t) => t.rowId === f.rowId) === index)
                    .map((f) => (
                      <FilterableValueLink key={f.id} name="hasRowId" value={f.rowId ?? ""} />
                    ))}
                </div>
              ),
            },
            {
              name: "rowValueId",
              title: "Row value",
              value: (item) => <FilterableValueLink name="rowValueId" value={item.rowValueId ?? ""} />,
            },
            {
              name: "tenant",
              title: "Tenant",
              value: (item) => <div>{item.tenant?.name}</div>,
            },
            {
              name: "user",
              title: "User",
              value: (item) => <div>{item.user?.email}</div>,
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (item) => DateUtils.dateYMDHMS(item.createdAt),
              formattedValue: (item) => (
                <div className="text-xs text-muted-foreground">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>
              ),
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
