"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useActionState } from "react";
import WorkflowVariableForm from "@/modules/workflowEngine/components/workflowVariables/WorkflowVariableForm";
import UrlUtils from "@/utils/app/UrlUtils";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { LoaderData, updateWorkflowVariableAction } from "./variables.$id.api.server";
import toast from "react-hot-toast";

interface WorkflowsVariablesIdViewProps {
  data: LoaderData;
}

export default function WorkflowsVariablesIdView({ data }: WorkflowsVariablesIdViewProps) {
  const params = useParams();
  const router = useRouter();
  const [actionData, action, pending] = useActionState(updateWorkflowVariableAction, null);

  // Extract tenant from params (it would be in the route like /app/[tenant]/workflow-engine/...)
  const tenantId = params.tenant as string;

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
      if (actionData.redirect) {
        close();
      }
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function close() {
    router.push(UrlUtils.getModulePath(params, `workflow-engine/variables`));
  }

  return (
    <SlideOverWideEmpty title="Edit Variable" size="2xl" open={true} onClose={close}>
      <WorkflowVariableForm item={data.item} action={action} pending={pending} tenantId={tenantId} />
    </SlideOverWideEmpty>
  );
}
