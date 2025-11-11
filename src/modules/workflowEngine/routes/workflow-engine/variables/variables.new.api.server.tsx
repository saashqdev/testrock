import { redirect } from "next/navigation";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getUserInfo } from "@/lib/services/session.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace WorkflowsVariablesNewApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const data: LoaderData = {
      metatags: [{ title: `New Workflows Variable | ${process.env.APP_NAME}` }],
    };
    return data;
  };
  export const action = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const tenantId = await getTenantIdOrNull({ request, params });
    const userInfo = await getUserInfo();

    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    const value = form.get("value")?.toString() ?? "";

    if (action === "create") {
      try {
        const existing = await db.workflowVariable.getWorkflowVariableByName(name, { tenantId: tenantId?.toString() ?? null });
        if (existing) {
          throw Error("Variable already exists with name: " + name);
        }
        await db.workflowVariable.createWorkflowVariable({
          tenantId: tenantId?.toString() ?? null,
          createdByUserId: userInfo.userId,
          name,
          value,
        });
        throw redirect(UrlUtils.getModulePath(params, `workflow-engine/variables`));
      } catch (e: any) {
        return Response.json({ error: e.message }, { status: 400 });
      }
    }
    return Response.json({ error: "Invalid action" }, { status: 400 });
  };
}
