"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import RefreshIcon from "@/components/ui/icons/RefreshIcon";
import InputFilters from "@/components/ui/input/InputFilters";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import { FilterableValueLink } from "@/components/ui/links/FilterableValueLink";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateUtils from "@/lib/shared/DateUtils";
import { useTranslation } from "react-i18next";
import { FeedbackWithDetailsDto } from "@/db/models/helpDesk/FeedbackModel";

interface Props {
  data: {
    items: FeedbackWithDetailsDto[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
  };
  deleteAction?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}
export default function FeedbackTable({ data, deleteAction }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const canDelete = !params.tenant;

  const searchParams = useSearchParams();

  const [selectedRows, setSelectedRows] = useState<FeedbackWithDetailsDto[]>([]);
  
  async function onDelete(ids: string[]) {
    if (!canDelete || !deleteAction) {
      return;
    }
    startTransition(async () => {
      const form = new FormData();
      form.set("action", "delete");
      form.set("ids", ids.join(","));
      
      try {
        const result = await deleteAction(form);
        
        if (result.success) {
          router.refresh();
          setSelectedRows([]);
        } else if (result.error) {
          // You might want to show a toast notification here
          console.error(result.error);
        }
      } catch (error) {
        console.error("Failed to delete feedback:", error);
      }
    });
  }

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }
  return (
    <div className="space-y-2">
      <div className="flex w-full items-center space-x-2">
        <div className="flex-grow">
          <InputSearchWithURL />
        </div>
        {canDelete && selectedRows.length > 0 && (
          <ButtonSecondary
            destructive
            onClick={() => {
              onDelete(selectedRows.map((x) => x.id));
              setSelectedRows([]);
            }}
          >
            {t("shared.delete")} {selectedRows.length}
          </ButtonSecondary>
        )}
        <ButtonSecondary onClick={handleRefresh} isLoading={isPending}>
          <RefreshIcon className="h-4 w-4" />
        </ButtonSecondary>
        <InputFilters filters={data.filterableProperties} />
      </div>
      <TableSimple
        selectedRows={canDelete ? selectedRows : undefined}
        onSelected={canDelete ? setSelectedRows : undefined}
        items={data.items}
        pagination={data.pagination}
        actions={[
          {
            title: t("shared.delete"),
            onClick: (_, item) => onDelete([item.id]),
            hidden: () => !canDelete,
            disabled: () => !canDelete,
            destructive: true,
          },
        ]}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateYMDHMS(item.createdAt),
            formattedValue: (item) => (
              <div className="text-muted-foreground text-xs">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>
            ),
          },
          {
            name: "tenant",
            title: "Tenant",
            value: (item) => <FilterableValueLink name="tenantId" value={item?.tenant?.name} param={item?.tenant?.id} />,
            hidden: !!params.tenant,
          },
          {
            name: "user",
            title: t("models.user.object"),
            value: (item) => <FilterableValueLink name="userId" value={item.user?.email} param={item.user?.id} />,
          },
          {
            name: "message",
            title: t("feedback.message"),
            value: (item) => <div>{item.message}</div>,
          },
        ]}
      />
    </div>
  );
}
