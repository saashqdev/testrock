import { redirect } from "next/navigation";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import CryptoApi from "@/utils/api/server/CryptoApi";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getUserInfo } from "@/lib/services/session.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
};
export const loader = async (props: IServerComponentsProps) => {
  await requireAuth();
  const data: LoaderData = {
    metatags: [{ title: `New Workflows Credential | ${process.env.APP_NAME}` }],
  };
  return data;
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdOrNull({ request, params });
  const userInfo = await getUserInfo();

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("credential-name")?.toString() ?? "";
  let value = form.get("credential-value")?.toString() ?? "";

  if (action === "create") {
    try {
      const existing = await db.workflowCredentials.getWorkflowCredentialByName(name, { tenantId: tenantId?.toString() ?? null });
      if (existing) {
        throw Error("Credential already exists with name: " + name);
      }
      value = CryptoApi.encrypt(value);
      await db.workflowCredentials.createWorkflowCredential({
        tenantId: tenantId?.toString() ?? null,
        createdByUserId: userInfo.userId,
        name,
        value,
      });
      throw redirect(UrlUtils.getModulePath(params, `workflow-engine/credentials`));
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  }
  return Response.json({ error: "Invalid action" }, { status: 400 });
};
