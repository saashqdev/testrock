"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { deleteAndCancelTenant } from "@/utils/services/tenantService";
import EventsService from "@/modules/events/services/.server/EventsService";
import { getUserInfo } from "@/lib/services/session.server";
import { getActiveTenantSubscriptions } from "@/utils/services/server/subscriptionService";
import { RowsApi } from "@/utils/api/server/RowsApi";
import { storeSupabaseFile } from "@/utils/integrations/supabaseService";
import { AccountUpdatedDto } from "@/modules/events/dtos/AccountUpdatedDto";
import { AccountDeletedDto } from "@/modules/events/dtos/AccountDeletedDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type ActionData = {
  updateDetailsError?: string;
  deleteError?: string;
  success?: string;
};

const badRequest = (data: ActionData) => Response.json(data, { status: 400 });

export async function action(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const currentUser = await db.users.getUser(userInfo.userId);
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.account.update", tenantId);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  const tenant = await db.tenants.getTenant(tenantId);
  if (!tenant || !currentUser) {
    return redirect("/app");
  }

  if (action === "edit") {
    const name = form.get("name")?.toString() ?? "";
    const slug = form.get("slug")?.toString().toLowerCase() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    if ((name?.length ?? 0) < 1) {
      return badRequest({
        updateDetailsError: "Account name must have at least 1 character",
      });
    }
    if (!slug || slug.length < 1) {
      return badRequest({ updateDetailsError: "Account slug must have at least 1 character" });
    }

    if (["settings"].includes(slug.toLowerCase())) {
      return badRequest({
        updateDetailsError: "Slug cannot be " + slug,
      });
    }
    if (slug.includes(" ")) {
      return badRequest({
        updateDetailsError: "Slug cannot contain white spaces",
      });
    }

    const existing = await db.tenants.getTenant(tenantId);
    if (!existing) {
      return badRequest({ updateDetailsError: "Tenant not found" });
    }
    await db.logs.createLog(request, tenantId, "Update tenant details", JSON.stringify({ name, slug }));

    const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId, name: "tenantSettings" });
    if (tenantSettingsEntity) {
      try {
        await RowsApi.createCustom({
          entity: tenantSettingsEntity,
          tenantId,
          t,
          form,
          row: existing?.tenantSettingsRow?.row,
          rowCreateInput: { tenantSettingsRow: { create: { tenantId } } },
          request,
        });
      } catch (e: any) {
        return badRequest({ updateDetailsError: e.message });
      }
    }

    if (existing?.slug !== slug) {
      const existingSlug = await db.tenants.getTenantBySlug(slug);
      if (existingSlug) {
        return badRequest({
          updateDetailsError: "Slug already taken",
        });
      }
      let iconStored = icon ? await storeSupabaseFile({ bucket: "accounts-icons", content: icon, id: tenantId }) : icon;
      await db.tenants.updateTenant(existing, { name, icon: iconStored, slug });
      await EventsService.create({
        request,
        event: "account.updated",
        tenantId: tenant.id,
        userId: currentUser.id,
        data: {
          id: tenant.id,
          new: { name, slug },
          old: { name: tenant.name, slug: tenant.slug },
          user: { id: currentUser.id ?? "", email: currentUser.email },
        } satisfies AccountUpdatedDto,
      });
      return redirect(`/app/${slug}/settings/account`);
    } else {
      let iconStored = icon ? await storeSupabaseFile({ bucket: "accounts-icons", content: icon, id: tenantId }) : icon;
      await db.tenants.updateTenant(existing, { name, icon: iconStored, slug });
      await EventsService.create({
        request,
        event: "account.updated",
        tenantId: tenant.id,
        userId: currentUser.id,
        data: {
          id: tenant.id,
          new: { name, slug },
          old: { name: tenant.name, slug: tenant.slug },
          user: { id: currentUser.id, email: currentUser.email },
        } satisfies AccountUpdatedDto,
      });
      const actionData: ActionData = {
        success: t("settings.tenant.updated"),
      };
      return Response.json(actionData);
    }
  } else if (action === "delete") {
    await EventsService.create({
      request,
      event: "account.deleted",
      tenantId: null,
      userId: currentUser.id,
      data: {
        tenant: { id: tenant.id, name: tenant.name },
        user: { id: currentUser.id, email: currentUser.email },
      } satisfies AccountDeletedDto,
    });
    await verifyUserHasPermission("app.settings.account.delete", tenantId);
    const activeSubscriptions = await getActiveTenantSubscriptions(tenantId);
    if (activeSubscriptions && activeSubscriptions.products.find((f) => !f.cancelledAt)) {
      return badRequest({
        deleteError: "You cannot delete a tenant with active subscriptions",
      });
    }
    await deleteAndCancelTenant({ tenantId, userId: userInfo.userId, t });
    return redirect("/app");
  } else {
    return badRequest({ updateDetailsError: t("shared.invalidForm") });
  }
}
