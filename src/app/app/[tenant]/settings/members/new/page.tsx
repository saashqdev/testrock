"use server";

import { getTenant } from "@/modules/accounts/services/TenantService";
import { db } from "@/db";
import { getUser } from "@/modules/accounts/services/UserService";
import { sendEmail } from "@/modules/emails/services/EmailService";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { PlanFeatureUsageDto } from "@/modules/subscriptions/dtos/PlanFeatureUsageDto";
import { getPlanFeatureUsage } from "@/modules/subscriptions/services/SubscriptionService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { DefaultAppFeatures } from "@/modules/subscriptions/data/appFeatures";
import { getBaseURL } from "@/lib/services/url.server";
import { getUserInfo } from "@/lib/services/session.server";
import EmailTemplates from "@/modules/emails/utils/EmailTemplates";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { requireTenantSlug } from "@/lib/services/url.server";
import Component from "./component";
import { redirect } from "next/navigation";
import FormHelper from "@/lib/helpers/FormHelper";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("settings.members.actions.new")} | ${getDefaultSiteTags.title}`,
  });
}

type LoaderData = {
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};

const loader = async () => {
  const { t } = await getServerTranslations();
  const tenantSlug = await requireTenantSlug();
  const tenantId = await getTenantIdFromUrl(tenantSlug);
  await verifyUserHasPermission("app.settings.members.create", tenantId.id);
  const featurePlanUsage = await getPlanFeatureUsage(tenantId.id, DefaultAppFeatures.Users);
  const data: LoaderData = {
    featurePlanUsage,
  };
  return data;
};

export type NewMemberActionData = {
  error?: string;
  success?: string;
};

export const actionAppSettingsMembersNew = async (prev: any, form: FormData) => {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const tenantSlug = await requireTenantSlug();
  const tenantId = await getTenantIdFromUrl(tenantSlug);
  await verifyUserHasPermission("app.settings.members.create", tenantId.id);
  const { userId } = await getUserInfo();

  const fromUser = await getUser(userId!);
  const tenant = await getTenant(tenantId.id);
  if (!tenant || !fromUser) {
    return { error: "Could not find tenant or user" };
  }

  const email = form.get("email")?.toString().toLowerCase().trim() ?? "";
  const firstName = form.get("first-name")?.toString() ?? "";
  const lastName = form.get("last-name")?.toString() ?? "";
  const sendInvitationEmail = FormHelper.getBoolean(form, "send-invitation-email");

  try {
    const user = await db.users.getUserByEmail(email);
    if (user) {
      const tenantUser = await db.tenantUser.get({ tenantId: tenantId.id, userId: user.id });
      if (tenantUser) {
        return { error: "User already in organization" };
      }
    }

    const invitationId = await db.tenantUserInvitations.createUserInvitation(tenantId.id, {
      email,
      firstName,
      lastName,
      type: TenantUserType.MEMBER, // Replace "member" with the appropriate TenantUserType if needed
      fromUserId: fromUser?.id ?? null,
    });
    const invitation = await db.tenantUserInvitations.getUserInvitations(invitationId.id ?? invitationId);
    if (!invitation) {
      return { error: "Could not create invitation" };
    }

    if (sendInvitationEmail) {
      // appConfiguration.app.theme is now consistently a string
      const emailAppConfiguration = {
        ...appConfiguration,
        app: {
          ...appConfiguration.app,
          theme: appConfiguration.app?.theme ?? "system",
        },
      };

      await sendEmail({
        to: email,
        ...EmailTemplates.USER_INVITATION_EMAIL.parse({
          name: firstName,
          invite_sender_name: fromUser.firstName,
          invite_sender_organization: tenant.name,
          appConfiguration: emailAppConfiguration,
          action_url: (await getBaseURL()) + `/invitation/${invitation[0].id}`,
        }),
      });
    }
  } catch (e: any) {
    return { error: e.error };
  }
  return redirect(`/app/${tenantSlug}/settings/members`);
};

export default async function () {
  const data = await loader();
  return <Component data={data} />;
}
