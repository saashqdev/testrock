"use client";

import { Fragment, ReactNode, useEffect, useRef, useState, useActionState, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import RowsList from "@/components/entities/rows/RowsList";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputFilters, { FilterDto } from "@/components/ui/input/InputFilters";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { Routes } from "@/utils/api/server/EntitiesApi";
import { EntityViewsWithDetailsDto } from "@//db/models/entityBuilder/EntityViewsModel";
import { RowWithDetailsDto } from "@//db/models/entityBuilder/RowsModel";
import { useAppData } from "@/lib/state/useAppData";
import EntityViewForm from "@/components/entities/views/EntityViewForm";
import { UserDto } from "@//db/models/accounts/UsersModel";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { ActionData } from "../routes/Rows_List.server";
import { toast } from "sonner";
import { GetRowsData } from "@/utils/api/server/RowsApi";
import RunPromptFlowButtons from "@/modules/promptBuilder/components/run/RunPromptFlowButtons";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import TrashIcon from "@/components/ui/icons/TrashIcon";
import clsx from "clsx";

interface Props {
  title?: ReactNode;
  rowsData: GetRowsData;
  items: RowWithDetailsDto[];
  routes?: Routes;
  onNewRow?: () => void;
  onEditRow?: (item: RowWithDetailsDto) => void;
  saveCustomViews?: boolean;
  permissions: {
    create: boolean;
  };
  currentSession: {
    user: UserDto;
    isSuperAdmin: boolean;
  } | null;
  action?: (prevState: any, formData: FormData) => Promise<ActionData | null>;
}
// Default no-op action to avoid creating new function on every render
const defaultAction = async () => null;

function RowsViewRoute({ title, rowsData, items, routes, onNewRow, onEditRow, saveCustomViews, permissions, currentSession, action }: Props) {
  const { t } = useTranslation();
  const [actionData, formAction, pending] = useActionState(action || defaultAction, null);
  const appData = useAppData();
  const pathname = usePathname();
  const [searchParams] = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  
  // Memoize newSearchParams to avoid recreating on every render
  const newSearchParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);

  const confirmDeleteRows = useRef<RefConfirmModal>(null);

  const [bulkActions, setBulkActions] = useState<string[]>([]);

  const [view, setView] = useState(() => {
    const params = new URLSearchParams(searchParamsString);
    return rowsData.currentView?.layout ?? params.get("view") ?? "table";
  });
  const [filters, setFilters] = useState<FilterDto[]>([]);

  const [showCustomViewModal, setShowCustomViewModal] = useState(false);
  const [editingView, setEditingView] = useState<EntityViewsWithDetailsDto | null>(null);

  const [selectedRows, setSelectedRows] = useState<RowWithDetailsDto[]>([]);

  useEffect(() => {
    setFilters(EntityHelper.getFilters({ t, entity: rowsData.entity, pagination: rowsData.pagination }));
    const bulkActions: string[] = [];
    if (rowsData.entity.hasBulkDelete) {
      bulkActions.push("bulk-delete");
    }
    setBulkActions(bulkActions);
  }, [rowsData.entity.id, rowsData.entity.hasBulkDelete, rowsData.pagination, t]);

  useEffect(() => {
    const newView = rowsData.currentView?.layout ?? newSearchParams.get("view") ?? "table";
    setView(newView);
  }, [newSearchParams, rowsData.currentView?.layout]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
      setSelectedRows([]);
    } else if (actionData?.rowsDeleted) {
      setSelectedRows((rows) => rows.filter((row) => !actionData?.rowsDeleted?.includes(row.id)));
    }
    if (actionData?.updatedView) {
      setShowCustomViewModal(false);
      setEditingView(null);
    }
  }, [actionData]);

  useEffect(() => {
    setShowCustomViewModal(false);
    setEditingView(null);
  }, [searchParamsString]);

  function onCreateView() {
    setShowCustomViewModal(true);
    setEditingView(null);
  }

  function onUpdateView() {
    setShowCustomViewModal(true);
    setEditingView(rowsData.currentView);
  }

  function isCurrenView(view: EntityViewsWithDetailsDto) {
    return rowsData.currentView?.id === view.id;
  }

  function canUpdateCurrentView() {
    if (currentSession?.isSuperAdmin) {
      return true;
    }
    if (!rowsData.currentView) {
      return false;
    }
    if (rowsData.currentView.userId === currentSession?.user.id) {
      return true;
    }
    if (appData?.currentTenant?.id && rowsData.currentView.tenantId === appData?.currentTenant.id && appData?.isSuperUser) {
      return true;
    }
    return false;
  }

  function onDeleteSelectedRows() {
    confirmDeleteRows.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteSelectedRowsConfirmed() {
    const form = new FormData();
    form.set("action", "bulk-delete");
    selectedRows.forEach((item) => {
      form.append("rowIds[]", item.id);
    });
    if (formAction) {
      formAction(form);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="flex items-center justify-between space-x-2 md:py-2">
        {selectedRows.length > 0 ? (
          <div className="flex space-x-1">{bulkActions.includes("bulk-delete") && <DeleteIconButton onClick={onDeleteSelectedRows} />}</div>
        ) : (
          <Fragment>
            {rowsData.views.length > 1 ? (
              <TabsWithIcons
                className="grow xl:flex"
                tabs={rowsData.views.map((item) => {
                  // Create a new URLSearchParams for each tab to avoid mutation
                  const tabParams = new URLSearchParams(searchParamsString);
                  tabParams.set("v", item.name);
                  tabParams.delete("page");
                  return {
                    name: t(item.title),
                    href: pathname + "?" + tabParams.toString(),
                    current: isCurrenView(item),
                  };
                })}
              />
            ) : (
              title ?? <h3 className="flex flex-1 items-center truncate font-bold">{t(rowsData.currentView?.title ?? rowsData.entity.titlePlural)}</h3>
            )}
          </Fragment>
        )}
        <div className="flex items-center space-x-1">
          {filters.length > 0 && <InputFilters filters={filters} />}
          <RunPromptFlowButtons type="list" promptFlows={rowsData.promptFlows} className="p-0.5" />
          {permissions.create && (
            <ButtonPrimary disabled={!permissions.create} to={!onNewRow ? EntityHelper.getRoutes({ routes, entity: rowsData.entity })?.new : undefined} onClick={onNewRow}>
              <span className="sm:text-sm">+</span>
            </ButtonPrimary>
          )}
        </div>
      </div>

      <div>
        <RowsList
          view={view as "table" | "board" | "grid" | "card"}
          entity={rowsData.entity}
          items={items}
          routes={routes}
          pagination={rowsData.pagination}
          onEditRow={onEditRow}
          currentView={rowsData.currentView}
          selectedRows={selectedRows}
          onSelected={!bulkActions.length ? undefined : (rows) => setSelectedRows(rows)}
        />
        <div className="mt-2 flex items-center justify-between space-x-2">
          <div>
            <div className="hidden sm:block">
              {rowsData.pagination && rowsData.pagination.totalItems > 0 && routes && (
                <Link
                  className="text-xs font-medium text-muted-foreground hover:underline"
                  href={EntityHelper.getRoutes({ routes, entity: rowsData.entity })?.export + "?" + newSearchParams}
                >
                  {rowsData.pagination.totalItems === 1 ? (
                    <div>{t("shared.exportResult")}</div>
                  ) : (
                    <div>{t("shared.exportResults", { 0: rowsData.pagination.totalItems })}</div>
                  )}
                </Link>
              )}
            </div>
          </div>

          {saveCustomViews && rowsData.entity.hasViews && (
            <Fragment>
              {canUpdateCurrentView() ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <button type="button" className="text-xs font-medium hover:underline" disabled={!canUpdateCurrentView()} onClick={onUpdateView}>
                    {t("models.view.actions.update")}
                  </button>
                  <div>•</div>
                  <button type="button" className="text-xs font-medium hover:underline" onClick={onCreateView}>
                    {t("models.view.actions.create")}
                  </button>
                </div>
              ) : (
                <button type="button" className="text-xs font-medium text-muted-foreground hover:underline" onClick={onCreateView}>
                  {t("models.view.actions.create")}
                </button>
              )}
            </Fragment>
          )}
        </div>
      </div>

      <ConfirmModal ref={confirmDeleteRows} onYes={onDeleteSelectedRowsConfirmed} />

      <div className="z-50">
        <SlideOverWideEmpty
          title={editingView ? "Edit view" : `New ${t(rowsData.entity.title)} view`}
          size="2xl"
          open={showCustomViewModal}
          onClose={() => setShowCustomViewModal(false)}
        >
          {showCustomViewModal && (
            <EntityViewForm
              entity={rowsData.entity}
              tenantId={appData?.currentTenant?.id ?? null}
              userId={currentSession?.user.id ?? null}
              item={editingView}
              canDelete={true}
              onClose={() => setShowCustomViewModal(false)}
              actionNames={{
                create: "view-create",
                update: "view-edit",
                delete: "view-delete",
              }}
              isSystem={false}
              showViewType={currentSession?.isSuperAdmin ?? false}
              onSubmit={formAction}
            />
          )}
        </SlideOverWideEmpty>
      </div>
    </div>
  );
}

function DeleteIconButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      className={clsx(
        "focus:outline-hidden group flex items-center rounded-md border border-transparent px-4 py-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        pending && "base-spinner"
      )}
      disabled={pending}
      onClick={onClick}
    >
      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
    </button>
  );
}

// Memoize the component with custom comparison
export default memo(RowsViewRoute, (prevProps, nextProps) => {
  // Check if items changed (length or content)
  if (prevProps.items !== nextProps.items) {
    if (prevProps.items.length !== nextProps.items.length) return false;
    for (let i = 0; i < prevProps.items.length; i++) {
      if (prevProps.items[i].id !== nextProps.items[i].id) return false;
    }
  }
  
  // Check other critical props
  return (
    prevProps.rowsData.entity.id === nextProps.rowsData.entity.id &&
    prevProps.permissions.create === nextProps.permissions.create &&
    prevProps.currentSession?.user?.id === nextProps.currentSession?.user?.id &&
    prevProps.onNewRow === nextProps.onNewRow &&
    prevProps.onEditRow === nextProps.onEditRow
  );
});
