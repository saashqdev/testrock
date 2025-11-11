"use client";

import { useActionState } from "react";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import PromptGroupForm from "@/modules/promptBuilder/components/PromptGroupForm";
import { createPromptGroupAction } from "./actions";

type ActionData = {
  error?: string;
  success?: string;
};

export default function NewPromptGroupPage() {
  const [actionData, formAction] = useActionState<ActionData | null, FormData>(
    createPromptGroupAction,
    null
  );

  return (
    <div>
      <PromptGroupForm item={undefined} formAction={formAction} />

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </div>
  );
}
