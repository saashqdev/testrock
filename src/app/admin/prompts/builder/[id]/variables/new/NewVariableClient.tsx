"use client";

import { useTransition } from "react";
import PromptFlowVariableForm from "@/modules/promptBuilder/components/outputs/PromptFlowVariableForm";
import { handleNewVariableAction } from "./actions";

type NewVariableClientProps = {
  id: string;
};

export default function NewVariableClient({ id }: NewVariableClientProps) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await handleNewVariableAction(formData, id);
    });
  }

  return (
    <div>
      <PromptFlowVariableForm item={undefined} formAction={handleAction} />
    </div>
  );
}
