"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import PromptFlowOutputMappingForm from "@/modules/promptBuilder/components/outputs/PromptFlowOutputMappingForm";
import { PromptFlowOutputMappingWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputMappingsModel";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

type PageData = {
  promptFlow: PromptFlowWithDetailsDto;
  promptFlowOutput: PromptFlowOutputWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  item: PromptFlowOutputMappingWithDetailsDto;
};

interface OutputMappingClientProps {
  data: PageData;
  params: Record<string, string>;
}

export default function OutputMappingClient({ data, params }: OutputMappingClientProps) {
  const router = useRouter();
  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete output?", "Delete", "Cancel", `Are you sure you want to delete the output?`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promptTemplateId = formData.get("promptTemplateId")?.toString() || "";
    const propertyId = formData.get("propertyId")?.toString() || "";

    try {
      const response = await fetch(`/api/admin/prompts/builder/${params.id}/outputs/${params.output}/mappings/${params.mapping}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action: "edit",
          promptTemplateId,
          propertyId
        }),
      });

      if (response.ok) {
        router.push(`/admin/prompts/builder/${params.id}/outputs`);
        router.refresh();
      } else {
        const error = await response.json();
        console.error("Update failed:", error);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  }

  async function onConfirmDelete() {
    try {
      const response = await fetch(`/api/admin/prompts/builder/${params.id}/outputs/${params.output}/mappings/${params.mapping}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete" }),
      });

      if (response.ok) {
        router.push(`/admin/prompts/builder/${params.id}/outputs`);
        router.refresh();
      } else {
        const error = await response.json();
        console.error("Delete failed:", error);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  return (
    <div>
      <PromptFlowOutputMappingForm
        item={data.item}
        promptFlow={data.promptFlow}
        promptFlowOutput={data.promptFlowOutput}
        allEntities={data.allEntities}
        onDelete={onDelete}
        onSubmit={handleSubmit}
      />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} />
    </div>
  );
}
