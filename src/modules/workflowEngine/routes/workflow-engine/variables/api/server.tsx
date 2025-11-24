import { WorkflowVariable } from "@prisma/client";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
  items: WorkflowVariable[];
  children?: React.ReactNode;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await db.workflowVariable.getAllWorkflowVariables({ tenantId: tenantId?.toString() ?? null });
  const data: LoaderData = {
    metatags: [{ title: `Workflow Variables | ${process.env.APP_NAME}` }],
    items,
    children: props.children,
  };
  return data;
};
