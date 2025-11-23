"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import PromptGroupForm from "@/modules/promptBuilder/components/PromptGroupForm";
import { PromptFlowGroupWithDetailsDto } from "@/db/models/promptFlows/PromptFlowGroupsModel";

type ActionData = {
  error?: string;
  success?: string;
};

type PromptGroupEditClientProps = {
  item: PromptFlowGroupWithDetailsDto;
  actionData?: ActionData;
  updatePromptGroup: (formData: FormData) => Promise<{ error?: string } | undefined>;
};

export default function PromptGroupEditClient({ item, actionData, updatePromptGroup }: PromptGroupEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    const form = new FormData();
    form.set("action", "delete");
    form.set("id", item.id);

    startTransition(async () => {
      await updatePromptGroup(form);
      router.refresh();
    });
  }

  return (
    <div>
      <PromptGroupForm item={item} onDelete={onDelete} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}
