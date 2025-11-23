import { getServerTranslations } from "@/i18n/server";
import CrmService, { ContactFormSettings } from "@/modules/crm/services/CrmService";
import { getCurrentPage } from "@/modules/pageBlocks/services/server/pagesService";
import { PageLoaderData } from "@/modules/pageBlocks/dtos/PageBlockData";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";
import UserUtils from "@/utils/app/UserUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = PageLoaderData & {
  settings: ContactFormSettings;
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const params = (await props.params) || {};
  const request = props.request!;
  const page = await getCurrentPage({ request, params, slug: "/contact" });
  const data: LoaderData = {
    ...page,
    settings: await CrmService.getContactFormSettings(),
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
  const form = await request.formData();
  const action = form.get("action");

  if (action === "submission") {
    const submission = {
      firstName: form.get("first_name")?.toString() ?? "",
      lastName: form.get("last_name")?.toString() ?? "",
      email: form.get("email")?.toString() ?? "",
      company: form.get("company")?.toString() ?? "",
      jobTitle: form.get("jobTitle")?.toString() ?? "",
      users: form.get("users")?.toString() ?? "",
      message: form.get("comments")?.toString() ?? "",
      honeypot: form.get("codeId")?.toString() ?? "",
    };

    try {
      await IpAddressServiceServer.log(request, {
        action: "contact",
        description: `${submission.firstName} ${submission.lastName} <${submission.email}>`,
        metadata: submission,
        block: UserUtils.isSuspicious({
          email: submission.email,
          firstName: submission.firstName,
          lastName: submission.lastName,
          honeypot: submission.honeypot,
        }),
      });

      const existingContact = await CrmService.createContactSubmission(submission, request);

      if (existingContact) {
        return Response.json({ success: t("front.contact.success", { 0: submission.firstName }) }, { status: 200 });
      } else {
        return Response.json({ error: t("front.contact.error") }, { status: 400 });
      }
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};
