import type { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { prisma } from "@/db/config/prisma/database";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace WorkflowEngineIndexApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    summary: {
      workflowsTotal: number;
      credentialsTotal: number;
      variablesTotal: number;
      executionsTotal: number;
    };
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const tenantId = await getTenantIdOrNull({ request, params });
    const data: LoaderData = {
      metatags: [{ title: `Workflows | ${process.env.APP_NAME}` }],
      summary: {
        workflowsTotal: await prisma.workflow.count({ where: { tenantId: tenantId?.toString() ?? null } }),
        credentialsTotal: await prisma.workflowCredential.count({ where: { tenantId: tenantId?.toString() ?? null } }),
        variablesTotal: await prisma.workflowVariable.count({ where: { tenantId: tenantId?.toString() ?? null } }),
        executionsTotal: await db.workflowExecutions.countWorkflowExecutions({ tenantId: tenantId?.toString() ?? null }),
      },
    };
    return data;
  };
}
