"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserInfo } from "@/lib/services/session.server";
import WorkflowsService from "@/modules/workflowEngine/services/WorkflowsService";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowBlockDto } from "@/modules/workflowEngine/dtos/WorkflowBlockDto";
import { WorkflowBlockType } from "@/modules/workflowEngine/dtos/WorkflowBlockTypes";
import { WorkflowConditionsGroupDto } from "@/modules/workflowEngine/dtos/WorkflowConditionDtos";

type ActionState = {
  success?: string;
  error?: string;
} | null;

export async function saveWorkflowAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const workflowData = formData.get("workflow")?.toString();
    const redirectTo = formData.get("redirectTo")?.toString();

    if (!workflowId || !workflowData) {
      throw new Error("Missing required fields");
    }

    const workflow = JSON.parse(workflowData) as WorkflowDto;
    await WorkflowsService.update(workflowId, workflow, { tenantId });

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    if (redirectTo) {
      redirect(redirectTo);
    }

    return { success: `Workflow saved: ${workflow.name}` };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateBlockAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;
    const workflowId = formData.get("workflowId")?.toString();
    const blockId = formData.get("blockId")?.toString();
    const blockData = formData.get("block")?.toString();
    const redirectTo = formData.get("redirectTo")?.toString();

    if (!workflowId || !blockId || !blockData) {
      throw new Error("Missing required fields");
    }

    const workflow = await WorkflowsService.get(workflowId, { tenantId });
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const block = workflow.blocks.find((x) => x.id === blockId);
    if (!block) {
      throw new Error("Block not found");
    }

    const blockDto = JSON.parse(blockData) as WorkflowBlockDto;
    await WorkflowsService.updateBlock(blockId, blockDto, { workflow });

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    if (redirectTo) {
      redirect(redirectTo);
    }

    return { success: `Block updated: ${blockDto.type}` };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addBlockAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const fromBlockId = formData.get("fromBlockId")?.toString() ?? "";
    const condition = formData.get("condition")?.toString() ?? "";
    const type = formData.get("type")?.toString() as WorkflowBlockType;

    if (!workflowId || !type) {
      throw new Error("Missing required fields");
    }

    const workflow = await WorkflowsService.get(workflowId, { tenantId });
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    if (fromBlockId) {
      const fromBlock = workflow.blocks.find((x) => x.id === fromBlockId);
      if (!fromBlock) {
        throw new Error("From block not found");
      }
    }

    const newBlock = await WorkflowsService.addBlock({
      workflow,
      fromBlockId,
      type,
      condition,
    });

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    return { success: "Block added" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function connectBlocksAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const fromBlockId = formData.get("fromBlockId")?.toString();
    const toBlockId = formData.get("toBlockId")?.toString();
    const condition = formData.get("condition")?.toString();

    if (!workflowId || !fromBlockId || !toBlockId) {
      throw new Error("Missing required fields");
    }

    const workflow = await WorkflowsService.get(workflowId, { tenantId });
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    // TODO: Implement connect blocks logic in service
    // await WorkflowsService.connectBlocks({ fromBlockId, toBlockId, condition });

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    return { success: "Blocks connected" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteBlockAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const blockId = formData.get("blockId")?.toString();

    if (!workflowId || !blockId) {
      throw new Error("Missing required fields");
    }

    // TODO: Implement delete block logic in service
    // await WorkflowsService.deleteBlock(blockId);

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    return { success: "Block deleted" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteConnectionAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const connectionId = formData.get("connectionId")?.toString();
    const fromBlockId = formData.get("fromBlockId")?.toString();
    const toBlockId = formData.get("toBlockId")?.toString();

    if (!workflowId) {
      throw new Error("Missing workflow ID");
    }

    if (!connectionId && (!fromBlockId || !toBlockId)) {
      throw new Error("Missing connection information");
    }

    // TODO: Implement delete connection logic in service
    // if (connectionId) {
    //   await WorkflowsService.deleteConnection(connectionId);
    // } else {
    //   await WorkflowsService.deleteConnection({ fromBlockId, toBlockId });
    // }

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    return { success: "Connection deleted" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateConditionsGroupsAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const blockId = formData.get("blockId")?.toString();
    const conditionsGroupsData = formData.get("conditionsGroups")?.toString();

    if (!workflowId || !blockId || !conditionsGroupsData) {
      throw new Error("Missing required fields");
    }

    const conditionsGroups = JSON.parse(conditionsGroupsData) as WorkflowConditionsGroupDto[];

    // TODO: Implement update conditions groups logic in service
    // await WorkflowsService.updateConditionsGroups(blockId, conditionsGroups);

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    return { success: "Conditions updated" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleWorkflowAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      throw new Error("Unauthorized");
    }

    const tenantId = formData.get("tenantId")?.toString() || null;

    const workflowId = formData.get("workflowId")?.toString();
    const enabled = formData.get("enabled")?.toString() === "true";

    if (!workflowId) {
      throw new Error("Missing workflow ID");
    }

    // TODO: Implement toggle workflow logic in service
    // await WorkflowsService.toggle(workflowId, enabled);

    revalidatePath(`/workflow-engine/workflows/${workflowId}`);

    return { success: enabled ? "Workflow enabled" : "Workflow disabled" };
  } catch (error: any) {
    return { error: error.message };
  }
}
