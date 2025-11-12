"use client";

import { WorkflowCredential } from "@prisma/client";
import { useRef, useActionState } from "react";
import { Metadata } from "next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import DateCell from "@/components/ui/dates/DateCell";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import TableSimple from "@/components/ui/tables/TableSimple";
import { WorkflowsCredentialsApi } from "./credentials.api.server";

export const metadata: Metadata = {
  title: "Workflow Credentials",
};

interface WorkflowsCredentialsViewProps {
  data: WorkflowsCredentialsApi.LoaderData;
  deleteAction: (prev: any, formData: FormData) => Promise<any>;
}

export default function WorkflowsCredentialsView({ data, deleteAction }: WorkflowsCredentialsViewProps) {
  const confirmDelete = useRef<RefConfirmModal>(null);
  const [, deleteFormAction] = useActionState(deleteAction, null);

  function onDelete(item: WorkflowCredential) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show("Are you sure you want to delete this workflow?", "Delete", "No", "All blocks and executions will be deleted.");
  }

  function onDeleteConfirm(item: WorkflowCredential) {
    const formData = new FormData();
    formData.set("action", "delete");
    formData.set("id", item.id.toString() ?? "");
    deleteFormAction(formData);
  }
  return (
    <EditPageLayout
      title="Credentials"
      buttons={
        <>
          <ButtonPrimary to="credentials/new">New</ButtonPrimary>
        </>
      }
    >
      <div className="space-y-3">
        <TableSimple
          headers={[
            {
              title: "Name",
              name: "name",
              value: (item) => <div className="select-all">{`{{$credentials.${item.name}}}`}</div>,
            },
            {
              title: "Value",
              name: "value",
              className: "w-full",
              value: (item) => <div className="max-w-sm truncate">{"".padEnd(36, "*")}</div>,
            },
            {
              title: "Created At",
              name: "createdAt",
              value: (item) => <DateCell date={item.createdAt} />,
            },
          ]}
          items={data.items}
          actions={[
            {
              title: "Delete",
              onClick: (_, i) => onDelete(i),
              destructive: true,
            },
          ]}
        />
      </div>
      {data.children}

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}
