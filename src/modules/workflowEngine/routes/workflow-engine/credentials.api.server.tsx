import { WorkflowCredential } from "@prisma/client";
import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
  items: WorkflowCredential[];
  children?: React.ReactNode;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await db.workflowCredentials.getAllWorkflowCredentials({ tenantId: tenantId?.toString() ?? null });
  const data: LoaderData = {
    metatags: [{ title: `Workflow Credentials | ${process.env.APP_NAME}` }],
    items,
  };
  return data;
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    await db.workflowCredentials.deleteWorkflowCredential(id, { tenantId: tenantId?.toString() ?? null });
    throw redirect(UrlUtils.getModulePath(params, `workflow-engine/credentials`));
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};

