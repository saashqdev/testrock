import { useSearchParams, useRouter } from "next/navigation";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import * as Constants from "@/lib/constants";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";

export default function RowsLoadMoreCard({
  pagination,
  currentView,
  className,
}: {
  pagination?: PaginationDto;
  currentView?: EntityViewsWithDetailsDto | null;
  className?: string;
}) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const router = useRouter();
  
  function theresMore() {
    if (!pagination) {
      return false;
    }
    return pagination.totalItems > pagination.page * pagination.pageSize;
  }
  return (
    <Fragment>
      {theresMore() && (
        <div className={className}>
          <button
            type="button"
            className="border-border hover:border-border group inline-block h-full w-full truncate rounded-md border-2 border-dashed p-4 text-left align-middle shadow-2xs hover:border-dotted hover:bg-slate-100"
            onClick={() => {
              if (!pagination) {
                return;
              }
              let currentPageSize = 0;
              const paramsPageSize = newSearchParams.get("pageSize") ? parseInt(newSearchParams.get("pageSize") ?? "") : undefined;
              if (paramsPageSize) {
                currentPageSize = paramsPageSize;
              } else {
                currentPageSize = pagination.pageSize;
              }
              let currentViewPageSize = currentView ? currentView.pageSize : 0;
              if (currentViewPageSize === 0) {
                currentViewPageSize = Constants.DEFAULT_PAGE_SIZE;
              }
              const pageSize = currentPageSize + currentViewPageSize;
              newSearchParams.set("pageSize", pageSize.toString());
              router.push(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
            }}
          >
            <div className="text-foreground/80 mx-auto flex justify-center text-center align-middle text-sm font-medium">{t("shared.loadMore")}</div>
          </button>
        </div>
      )}
    </Fragment>
  );
}
