"use server";

import { PromptExecutionResultDto } from "../../dtos/PromptExecutionResultDto";
import PromptBuilderService from "../../services/server/PromptBuilderService";
import { getUserInfo } from "@/lib/services/session.server";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { getServerTranslations } from "@/i18n/server";

export type RunPromptFlowState = {
  promptFlowExecutionResult?: PromptExecutionResultDto | null;
  error?: string;
};

export async function runPromptFlowAction(prevState: RunPromptFlowState, formData: FormData): Promise<RunPromptFlowState> {
  try {
    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();

    if (!userInfo.userId) {
      return {
        error: "Authentication required",
      };
    }

    // Get tenant context from form data (passed by the component)
    const tenantSlug = formData.get("tenantSlug") as string | null;
    if (!tenantSlug) {
      return {
        error: "Tenant context required",
      };
    }
    const tenantId = await getTenantIdFromUrl(tenantSlug);

    const promptFlowExecutionResult = await PromptBuilderService.runFromForm({
      request: new Request("http://localhost", { method: "POST", body: formData }),
      params: {},
      form: formData,
      tenantId: tenantId?.id || null,
      userId: userInfo.userId,
      t,
    });

    return {
      promptFlowExecutionResult,
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}
