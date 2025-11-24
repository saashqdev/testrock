"use client";

import { useRouter, useParams } from "next/navigation";
import WorkflowCredentialForm from "@/modules/workflowEngine/components/workflowVariables/WorkflowCredentialForm";
import UrlUtils from "@/utils/app/UrlUtils";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";

export default function WorkflowsCredentialsNewView() {
  const params = useParams();
  const router = useRouter();
  function close() {
    router.push(UrlUtils.getModulePath(params, `workflow-engine/credentials`));
  }
  return (
    <SlideOverWideEmpty title="New Credential" size="2xl" open={true} onClose={close}>
      <WorkflowCredentialForm />
    </SlideOverWideEmpty>
  );
}
