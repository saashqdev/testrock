"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import RefreshIcon from "@/components/ui/icons/RefreshIcon";
import InputFilters from "@/components/ui/input/InputFilters";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import { FilterableValueLink } from "@/components/ui/links/FilterableValueLink";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateUtils from "@/lib/shared/DateUtils";
import { CreditsWithDetailsDto } from "@/db/models/subscriptions/CreditsModel";

interface Props {
  data: {
    items: CreditsWithDetailsDto[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
    canDelete: boolean;
  };
}
export default function CreditsList({ data }: Props) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const canDelete = data.canDelete;

  const searchParams = useSearchParams();

  const [selectedRows, setSelectedRows] = useState<CreditsWithDetailsDto[]>([]);
  function onDelete(ids: string[]) {
    if (!canDelete) {
      return;
    }
    startTransition(async () => {
      const form = new FormData();
      form.set("action", "delete");
      form.set("ids", ids.join(","));
      // TODO: Replace with actual form submission or API call
      // This would typically be an API call or server action in Next.js
      console.log("Delete action:", { action: "delete", ids });
    });
  }
  return (
    <div className="space-y-2">
      <div className="flex w-full items-center space-x-2">
        <div className="grow">
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
        <ButtonSecondary onClick={() => window.location.reload()} isLoading={isPending}>
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
              <div className="text-xs text-muted-foreground">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>
            ),
          },
          {
            name: "tenant",
            title: "Tenant",
            value: (item) => <FilterableValueLink name="tenantId" value={item?.tenant?.name} param={item?.tenant?.id} />,
            hidden: !!params.tenant,
          },

          {
            name: "type",
            title: t("shared.type"),
            value: (item) => <div>{item.type}</div>,
          },
          {
            name: "resource",
            title: t("models.credit.resource"),
            className: "w-full",
            value: (item) => (
              <div className="max-w-xs truncate">
                {item.objectId ? (
                  <Link href={item.objectId} className="truncate underline">
                    {item.objectId}
                  </Link>
                ) : (
                  <span className="truncate">{t("shared.undefined")}</span>
                )}
              </div>
            ),
          },
          {
            name: "user",
            title: t("models.user.object"),
            value: (item) => <FilterableValueLink name="userId" value={item.user?.email} param={item.user?.id} />,
          },
        ]}
      />
    </div>
  );
}
