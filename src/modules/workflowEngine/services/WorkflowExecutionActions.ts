"use server";

import { getUserInfo } from "@/lib/services/session.server";
import WorkflowsExecutionsService from "@/modules/workflowEngine/services/WorkflowsExecutionsService";

export async function executeWorkflow(prev: any, formData: FormData) {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const workflowId = formData.get("workflowId")?.toString();
    const inputData = formData.get("input")?.toString();

    if (!workflowId) {
      throw new Error("Workflow ID is required");
    }

    const tenantId = formData.get("tenantId")?.toString();
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const session = {
      tenantId: tenantId,
      userId: userInfo.userId,
    };

    let input = {};
    if (inputData) {
      try {
        input = JSON.parse(inputData);
      } catch (error) {
        throw new Error("Invalid JSON input");
      }
    }

    const execution = await WorkflowsExecutionsService.execute(workflowId, {
      type: "manual",
      input,
      session,
    });

    return {
      success: "Workflow executed successfully",
      execution,
    };
  } catch (error: any) {
    console.error("Error executing workflow:", error);
    return {
      error: error.message || "Failed to execute workflow",
    };
  }
}

export async function continueWorkflowExecution(prev: any, formData: FormData) {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const executionId = formData.get("executionId")?.toString();
    const input = formData.get("input")?.toString();

    if (!executionId) {
      throw new Error("Execution ID is required");
    }

    const tenantId = formData.get("tenantId")?.toString();
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const session = {
      tenantId: tenantId,
      userId: userInfo.userId,
    };

    await WorkflowsExecutionsService.continueExecution(executionId, {
      type: "manual",
      input: { input },
      session,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error continuing workflow execution:", error);
    return {
      error: error.message || "Failed to continue workflow execution",
    };
  }
}
