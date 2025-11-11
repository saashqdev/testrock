"use client";

import { Fragment, ReactNode, useRef, useState, useTransition } from "react";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import TrashEmptyIcon from "@/components/ui/icons/TrashEmptyIcon";
import EntityHelper from "@/lib/helpers/EntityHelper";
import RowTitle from "./RowTitle";
import { RowsApi } from "@/utils/api/server/RowsApi";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { useRouter } from "next/navigation";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { getUserHasPermission, getEntityPermission } from "@/lib/helpers/PermissionsHelper";
import ShareIcon from "@/components/ui/icons/ShareIcon";
import PencilIcon from "@/components/ui/icons/PencilIcon";
import RunPromptFlowButtons from "@/modules/promptBuilder/components/run/RunPromptFlowButtons";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export default function RowOverviewHeader({
  rowData,
  item,
  canUpdate,
  isEditing,
  routes,
  title,
  options,
  buttons,
  customActions,
  truncate = true,
}: {
  rowData: RowsApi.GetRowData;
  item: RowWithDetailsDto;
  canUpdate: boolean;
  isEditing: boolean;
  routes: EntitiesApi.Routes | undefined;
  title?: React.ReactNode;
  options?: {
    hideTitle?: boolean;
    hideMenu?: boolean;
    hideShare?: boolean;
    hideTags?: boolean;
    hideTasks?: boolean;
    hideActivity?: boolean;
    disableUpdate?: boolean;
    disableDelete?: boolean;
  };
  buttons?: ReactNode;
  customActions?: { entity: string; label: string; action: string }[];
  truncate?: boolean;
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [isPending, startTransition] = useTransition();
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const router = useRouter();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function getEditRoute() {
    if (isEditing) {
      return EntityHelper.getRoutes({ routes, entity: rowData.entity, item })?.overview;
    } else {
      return EntityHelper.getRoutes({ routes, entity: rowData.entity, item })?.edit;
    }
  }
  function canDelete() {
    return !options?.disableDelete && getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "delete")) && rowData.rowPermissions.canDelete;
  }

  function onDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteConfirm() {
    setSubmittingAction('delete');
    startTransition(() => {
      const form = document.createElement('form');
      form.method = 'POST';
      form.style.display = 'none';
      
      const actionInput = document.createElement('input');
      actionInput.type = 'hidden';
      actionInput.name = 'action';
      actionInput.value = 'delete';
      form.appendChild(actionInput);
      
      document.body.appendChild(form);
      form.submit();
      
      // Reset submitting state after form submission
      setTimeout(() => setSubmittingAction(null), 100);
    });
  }

  return (
    <div className="relative items-center justify-between space-y-2 border-b border-border pb-4 sm:flex sm:space-x-4 sm:space-y-0">
      <div className={clsx(truncate && "truncate", "flex flex-col")}>
        <div className={clsx(truncate && "truncate", "flex items-center space-x-2 text-xl font-bold")}>
          {title ?? <RowTitle entity={rowData.entity} item={item} />}
        </div>
      </div>

      <div className="flex shrink-0 items-center space-x-2 sm:justify-end">
        <div className="flex items-end space-x-2 space-y-0">
          {canUpdate || item.createdByUserId === appOrAdminData?.user?.id || appOrAdminData?.isSuperUser ? (
            <Fragment>
              {customActions
                ?.filter((f) => f.entity === rowData.entity.name)
                .map((customAction) => {
                  return (
                    <ButtonSecondary
                      key={customAction.action}
                      isLoading={isPending && submittingAction === customAction.action}
                      onClick={() => {
                        setSubmittingAction(customAction.action);
                        startTransition(() => {
                          const form = document.createElement('form');
                          form.method = 'POST';
                          form.style.display = 'none';
                          
                          const actionInput = document.createElement('input');
                          actionInput.type = 'hidden';
                          actionInput.name = 'action';
                          actionInput.value = customAction.action;
                          form.appendChild(actionInput);
                          
                          const idInput = document.createElement('input');
                          idInput.type = 'hidden';
                          idInput.name = 'id';
                          idInput.value = item.id;
                          form.appendChild(idInput);
                          
                          document.body.appendChild(form);
                          form.submit();
                          
                          // Reset submitting state after form submission
                          setTimeout(() => setSubmittingAction(null), 100);
                        });
                      }}
                    >
                      <span className="text-xs">{customAction.label}</span>
                    </ButtonSecondary>
                  );
                })}
              {buttons}
              {!options?.hideShare && (item.createdByUserId === appOrAdminData?.user?.id || appOrAdminData?.isSuperAdmin) && (
                <ButtonSecondary to="share">
                  <ShareIcon className="h-4 w-4 text-muted-foreground" />
                </ButtonSecondary>
              )}
              {rowData.entity.onEdit !== "overviewAlwaysEditable" && (
                <ButtonSecondary disabled={!EntityHelper.getRoutes({ routes, entity: rowData.entity, item })?.edit} to={getEditRoute()}>
                  <PencilIcon className="h-4 w-4 text-muted-foreground" />
                </ButtonSecondary>
              )}
              {isEditing && (
                <ButtonSecondary onClick={onDelete} disabled={!canDelete()}>
                  <TrashEmptyIcon className="h-4 w-4 text-muted-foreground" />
                </ButtonSecondary>
              )}
              <RunPromptFlowButtons type="edit" row={item} promptFlows={rowData.promptFlows} />
            </Fragment>
          ) : appOrAdminData?.isSuperAdmin ? (
            <ButtonSecondary to="share">
              <ShareIcon className="h-4 w-4 text-muted-foreground" />
            </ButtonSecondary>
          ) : null}
        </div>
      </div>

      <ConfirmModal ref={confirmDelete} destructive onYes={onDeleteConfirm} />
    </div>
  );
}
