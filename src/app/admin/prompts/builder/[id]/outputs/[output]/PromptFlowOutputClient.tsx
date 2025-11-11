"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import PromptFlowOutputForm from "@/modules/promptBuilder/components/outputs/PromptFlowOutputForm";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { deletePromptFlowOutputAction } from "../actions";

type PromptFlowOutputClientProps = {
  promptFlow: PromptFlowWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  item: PromptFlowOutputWithDetailsDto;
  promptFlowId: string;
  outputId: string;
};

export function PromptFlowOutputClient({ promptFlow, allEntities, item, promptFlowId, outputId }: PromptFlowOutputClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete output?", "Delete", "Cancel", `Are you sure you want to delete the output?`);
  }

  async function onConfirmDelete() {
    startTransition(async () => {
      const result = await deletePromptFlowOutputAction(outputId, promptFlowId);
      if (result.success) {
        router.push(`/admin/prompts/builder/${promptFlowId}/outputs`);
        router.refresh();
      } else {
        // Handle error - you might want to show a toast notification
        console.error(result.error);
      }
    });
  }

  return (
    <div>
      <PromptFlowOutputForm item={item} promptFlow={promptFlow} allEntities={allEntities} onDelete={onDelete} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} />
    </div>
  );
}
