"use client";

import { useRef, useTransition } from "react";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import PromptFlowVariableForm from "@/modules/promptBuilder/components/outputs/PromptFlowVariableForm";
import { PromptFlowInputVariableWithDetailsDto } from "@/db/models/promptFlows/PromptFlowInputVariablesModel";
import { handleVariableAction } from "../actions";

type VariablePageProps = {
  item: PromptFlowInputVariableWithDetailsDto;
  id: string;
};

export default function VariablePage({ item, id }: VariablePageProps) {
  const [isPending, startTransition] = useTransition();
  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete variable?", "Delete", "Cancel", `Are you sure you want to delete the variable?`);
  }

  function onConfirmDelete() {
    const form = new FormData();
    form.set("action", "delete");
    startTransition(async () => {
      await handleVariableAction(form, item.id, id);
    });
  }

  return (
    <div>
      <PromptFlowVariableForm item={item} onDelete={onDelete} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} />
    </div>
  );
}
