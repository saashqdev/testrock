import { getServerTranslations } from "@/i18n/server";
import CrmService, { NewsletterFormSettings } from "@/modules/crm/services/CrmService";
import { getCurrentPage } from "@/modules/pageBlocks/services/server/pagesService";
import { PageLoaderData } from "@/modules/pageBlocks/dtos/PageBlockData";
import { validateCSRFToken } from "@/lib/services/session.server";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";
import UserUtils from "@/utils/app/UserUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = PageLoaderData & {
  settings: NewsletterFormSettings;
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const params = (await props.params) || {};
  const request = props.request!;
  const page = await getCurrentPage({ request, params, slug: "/newsletter" });
  const data: LoaderData = {
    ...page,
    settings: await CrmService.getNewsletterFormSettings(),
  };
  return data;
};

export type ActionData = {
  error?: string;
  success?: string;
};

export const action = async (props: IServerComponentsProps): Promise<Response> => {
  const request = props.request!;
  const { t } = await getServerTranslations();

  try {
    await validateCSRFToken(request);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }

  const formData = await request.formData();
  const firstName = formData.get("first_name")?.toString() ?? "";
  const lastName = formData.get("last_name")?.toString() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const source = formData.get("source")?.toString() ?? "";
  const honeypot = formData.get("codeId")?.toString() ?? "";

  if (!email) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await IpAddressServiceServer.log(request, {
      action: "newsletter",
      description: `${firstName} ${lastName} <${email}>`,
      metadata: { source },
      block: UserUtils.isSuspicious({ email, firstName, lastName, honeypot }),
    });
    const subscribed = await CrmService.subscribeToNewsletter({
      firstName,
      lastName,
      email,
      source,
      request,
    });
    if (subscribed.success) {
      return Response.json({ success: t("front.newsletter.checkEmail") }, { status: 200 });
    } else {
      return Response.json({ error: subscribed.error }, { status: 400 });
    }
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
};
