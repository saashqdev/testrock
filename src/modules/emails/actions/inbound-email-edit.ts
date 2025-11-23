import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type ActionDataEmails = {
  error?: string;
};
const badRequest = (data: ActionDataEmails) => Response.json(data, { status: 400 });
export const actionInboundEmailEdit = async (props: IServerComponentsProps, redirectUrl: string) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();
  const form = await request.formData();

  const action = form.get("action");
  if (action === "delete") {
    await db.emails.deleteEmail(params.id ?? "");
    return redirect(redirectUrl);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};
