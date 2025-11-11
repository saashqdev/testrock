import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { prisma } from "@/db/config/prisma/database";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export namespace WorkflowsDangerApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    summary: {
      workflows: number;
      variables: number;
      credentials: number;
      executions: number;
    };
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const tenantId = await getTenantIdOrNull({ request, params });
    const data: LoaderData = {
      metatags: [{ title: `Danger | Workflows | ${process.env.APP_NAME}` }],
      summary: {
        workflows: await prisma.workflow.count({ where: { tenantId: tenantId?.toString() ?? null } }),
        credentials: await prisma.workflowCredential.count({ where: { tenantId: tenantId?.toString() ?? null } }),
        variables: await prisma.workflowVariable.count({ where: { tenantId: tenantId?.toString() ?? null } }),
        executions: await prisma.workflowExecution.count({ where: { tenantId: tenantId?.toString() ?? null } }),
      },
    };
    return data;
  };

  export type ActionData = {
    error?: string;
    success?: string;
  };
  export const action = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const form = await request.formData();
    const tenantId = await getTenantIdOrNull({ request, params });
    const action = form.get("action")?.toString();
    if (action === "reset-all-data") {
      const workflows = await prisma.workflow.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      const variables = await prisma.workflowVariable.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      const credentials = await prisma.workflowCredential.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      return Response.json({ success: `Deleted ${workflows.count} workflows, ${variables.count} variables and ${credentials.count} credentials.` });
    } else if (action === "delete-all-executions") {
      const executions = await prisma.workflowExecution.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      return Response.json({ success: `Deleted ${executions.count} executions.` });
    } else if (action === "delete-all-credentials") {
      const credentials = await prisma.workflowCredential.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      return Response.json({ success: `Deleted ${credentials.count} credentials.` });
    } else if (action === "delete-all-variables") {
      const variables = await prisma.workflowVariable.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      return Response.json({ success: `Deleted ${variables.count} variables.` });
    } else if (action === "delete-all-workflows") {
      const workflows = await prisma.workflow.deleteMany({ where: { tenantId: tenantId?.toString() ?? null } });
      return Response.json({ success: `Deleted ${workflows.count} workflows.` });
    } else {
      return Response.json({ error: "Invalid form" }, { status: 400 });
    }
  };
}
