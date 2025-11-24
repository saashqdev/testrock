"use client";

import Link from "next/link";
import { useRef, useActionState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import TenantBadge from "@/components/core/tenants/TenantBadge";
import DateCell from "@/components/ui/dates/DateCell";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import TableSimple from "@/components/ui/tables/TableSimple";
import WorkflowResultBadge from "@/modules/workflowEngine/components/executions/WorkflowResultBadge";
import { WorkflowExecutionWithDetailsDto } from "@/db/models/workflows/WorkflowExecutionsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import DateUtils from "@/lib/shared/DateUtils";
import { LoaderData } from "./api/server";

interface WorkflowsExecutionsViewProps {
  data: LoaderData;
  action: (formData: FormData) => Promise<{ error?: string; success?: string }>;
}

export default function WorkflowsExecutionsView({ data, action }: WorkflowsExecutionsViewProps) {
  const { t } = useTranslation();
  const params = useParams();
  const [actionData, submitAction, isPending] = useActionState(
    async (_state: { error?: string; success?: string }, formData: FormData) => {
      return await action(formData);
    },
    { error: undefined, success: undefined }
  );

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(item: WorkflowExecutionWithDetailsDto) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show("Delete execution?", "Delete", "Cancel", `Are you sure you want to delete this execution?`);
  }
  function onDeleteConfirm(item: WorkflowExecutionWithDetailsDto) {
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", item.id);
    submitAction(formData);
  }
  return (
    <EditPageLayout
      title={`Workflow Executions`}
      withHome={false}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
        </>
      }
    >
      <TableSimple
        items={data.items}
        actions={[
          {
            title: "Delete",
            onClick: (_idx, i) => (onDelete ? onDelete(i) : undefined),
            destructive: true,
            disabled: (i) => isPending,
            hidden: () => !!params.tenant,
          },
          {
            title: "Details",
            onClickRoute: (_idx, i) => UrlUtils.getModulePath(params, `workflow-engine/workflows/${i.workflowId}/executions?executionId=${i.id}`),
            firstColumn: true,
          },
        ]}
        headers={[
          {
            name: "type",
            title: "Type",
            value: (i) => <div>{i.type}</div>,
          },
          {
            name: "status",
            title: "Status",
            value: (i) => (
              <div className="flex max-w-xs flex-col truncate">
                <WorkflowResultBadge createdAt={i.createdAt} startedAt={i.createdAt} completedAt={i.endedAt} status={i.status} error={i.error} />
              </div>
            ),
          },
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => (i.tenant ? <TenantBadge item={i.tenant} /> : <span className="italic text-muted-foreground">Admin</span>),
          },
          {
            name: "trigger",
            title: "Trigger",
            value: (i) => <div>{i.blockRuns.length === 0 ? <span></span> : <span>{i.blockRuns[0].workflowBlock.type}</span>}</div>,
          },
          {
            name: "blockRuns",
            title: "Block runs",
            value: (i) => <div>{i.blockRuns.length === 1 ? <span>1 block run</span> : <span>{i.blockRuns.length} block runs</span>}</div>,
          },
          {
            name: "createdAt",
            title: "Created at",
            value: (i) => <DateCell date={i.createdAt} />,
          },
          {
            name: "duration",
            title: "Duration",
            value: (i) => DateUtils.getDurationInSeconds({ start: i.createdAt, end: i.endedAt }),
          },
          // {
          //   name: "endedAt",
          //   title: "Ended at",
          //   value: (i) => <DateCell date={i.endedAt} />,
          // },
          {
            name: "workflow",
            title: "Workflow",
            value: (i) => (
              <Link className="truncate font-medium hover:underline" href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${i.workflow.id}`)}>
                {i.workflow.name}
              </Link>
            ),
          },
        ]}
      />
      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}
