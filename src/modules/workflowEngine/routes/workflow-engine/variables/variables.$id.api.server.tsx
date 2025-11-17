import { WorkflowVariable } from "@prisma/client";
import { redirect } from "next/navigation";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
  item: WorkflowVariable;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await db.workflowVariable.getWorkflowVariableById(params.id ?? "", { tenantId: tenantId?.toString() ?? null });
  if (!item) {
    throw redirect(UrlUtils.getModulePath(params, `workflow-engine/variables`));
  }
  const data: LoaderData = {
    metatags: [{ title: `Edit Workflows Variable | ${process.env.APP_NAME}` }],
    item,
  };
  return data;
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const existing = await db.workflowVariable.getWorkflowVariableById(params.id ?? "", { tenantId: tenantId?.toString() ?? null });
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const value = form.get("value")?.toString() ?? "";

  if (action === "edit") {
    try {
      await db.workflowVariable.updateWorkflowVariable(params.id ?? "", {
        value,
      });
      throw redirect(UrlUtils.getModulePath(params, `workflow-engine/variables`));
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    await db.workflowVariable.deleteWorkflowVariable(existing.id);
    throw redirect(UrlUtils.getModulePath(params, `workflow-engine/variables`));
  }
  return Response.json({ error: "Invalid action" }, { status: 400 });
};


// Server Action for the Next.js form handling
export const updateWorkflowVariableAction = async (prev: any, formData: FormData) => {
  try {
    await requireAuth();

    const id = formData.get("id")?.toString();
    const action = formData.get("action")?.toString() ?? "";
    const value = formData.get("value")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const tenantIdStr = formData.get("tenantId")?.toString();

    if (!id) {
      return { error: "Variable ID is required" };
    }

    const tenantId = tenantIdStr || null;

    const existing = await db.workflowVariable.getWorkflowVariableById(id, { tenantId });
    if (!existing) {
      return { error: "Variable not found" };
    }

    if (action === "edit") {
      await db.workflowVariable.updateWorkflowVariable(id, { value });
      return { success: "Variable updated successfully" };
    } else if (action === "delete") {
      await db.workflowVariable.deleteWorkflowVariable(existing.id);
      return { success: "Variable deleted successfully", redirect: true };
    }

    return { error: "Invalid action" };
  } catch (e: any) {
    return { error: e.message };
  }
};
