"use server";

import { db } from "@/db";
import { TenantDto } from "@/db/models";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { addTenantUser, createTenant } from "@/modules/accounts/services/TenantService";
import { getUser } from "@/modules/accounts/services/UserService";
import { defaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { redirect } from "next/navigation";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: `${t("pricing.subscribe")} | ${defaultSiteTags.title}`,
  };
}

export const actionNewAccount = async (prev: any, form: FormData) => {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  if (!user) {
    throw redirect(`/login`);
  }
  try {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString();
    const tenant = await createTenant({ name, slug, userId: user.id });
    const roles = await db.roles.getAllRoles("app");
    await addTenantUser({
      tenantId: tenant.id,
      userId: user.id,
      roles,
    });
    return redirect(`/app/${tenant.slug}/dashboard`);
  } catch (e: any) {
    return { error: e.message };
  }
};

export default async function () {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await getUser(userInfo.userId) : null;
  if (!user) {
    throw redirect(`/login`);
  }
  return <Component />;
}
