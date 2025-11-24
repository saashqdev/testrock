"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import InputCheckbox from "@/components/ui/input/InputCheckbox";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import WorkflowUtils from "@/modules/workflowEngine/helpers/WorkflowUtils";

interface WorkflowToggleProps {
  workflow: WorkflowDto;
  onToggle: (formData: FormData) => Promise<{ success?: string; error?: string } | null>;
}

export default function WorkflowToggle({ workflow, onToggle }: WorkflowToggleProps) {
  const [state, formAction] = useActionState(async (_state: { success?: string; error?: string } | null, formData: FormData) => {
    return await onToggle(formData);
  }, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  function handleToggle(value: boolean | ((prev: boolean) => boolean)) {
    const checked = typeof value === "function" ? value(workflow.status === "live") : value;
    const formData = new FormData();
    formData.append("enabled", checked ? "true" : "false");
    formAction(formData);
  }

  return (
    <InputCheckbox
      disabled={!WorkflowUtils.isReady(workflow) && workflow.status !== "live"}
      asToggle
      value={workflow.status === "live"}
      setValue={handleToggle}
    />
  );
}
