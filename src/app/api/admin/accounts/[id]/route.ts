import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { createStripeCustomer } from "@/utils/stripe.server";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import EventsService from "@/modules/events/services/.server/EventsService";
import { AccountDeletedDto } from "@/modules/events/dtos/AccountDeletedDto";
import { AccountUpdatedDto } from "@/modules/events/dtos/AccountUpdatedDto";
import { deleteAndCancelTenant } from "@/utils/services/tenantService";
import { createCustom } from "@/utils/api/server/RowsApi";
import { redirect } from "next/navigation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST handler for edit and create-stripe-customer actions
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await verifyUserHasPermission("admin.account.settings.update");
    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();
    const currentUser = await db.users.getUser(userInfo.userId);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    const params = await context.params;
    const formData = await request.formData();
    const action = formData.get("action")?.toString() ?? "";

    const tenant = await db.tenants.getTenant(params.id);
    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    if (action === "edit") {
      const name = formData.get("name")?.toString() ?? "";
      const slug = formData.get("slug")?.toString().toLowerCase() ?? "";
      const icon = formData.get("icon")?.toString() ?? "";
      const typeIds = formData.getAll("typeIds[]").map((t) => t.toString());

      // Validation
      if ((name?.length ?? 0) < 1) {
        return NextResponse.json(
          { error: "Account name must have at least 1 character" },
          { status: 400 }
        );
      }
      if (!slug || slug.length < 1) {
        return NextResponse.json(
          { error: "Account slug must have at least 1 character" },
          { status: 400 }
        );
      }

      const tenantTypes = await db.tenantTypes.getAllTenantTypes();
      for (const typeId of typeIds) {
        if (!tenantTypes.find((t) => t.id === typeId)) {
          return NextResponse.json(
            { error: "Invalid tenant type" },
            { status: 400 }
          );
        }
      }

      if (["settings"].includes(slug.toLowerCase())) {
        return NextResponse.json(
          { error: `Slug cannot be ${slug}` },
          { status: 400 }
        );
      }
      if (slug.includes(" ")) {
        return NextResponse.json(
          { error: "Slug cannot contain white spaces" },
          { status: 400 }
        );
      }

      const existing = await db.tenants.getTenant(params.id);
      if (!existing) {
        return NextResponse.json(
          { error: "Invalid tenant" },
          { status: 400 }
        );
      }

      if (existing.slug !== slug) {
        const existingSlug = await db.tenants.getTenantBySlug(slug);
        if (existingSlug) {
          return NextResponse.json(
            { error: "Slug already taken" },
            { status: 400 }
          );
        }
      }

      await db.logs.createAdminLog(request, "Update tenant details", JSON.stringify({ name, slug }));

      const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId: null, name: "tenantSettings" });
      if (tenantSettingsEntity) {
        try {
          await createCustom({
            entity: tenantSettingsEntity,
            tenantId: existing.id,
            t,
            form: formData,
            row: existing?.tenantSettingsRow?.row,
            rowCreateInput: { tenantSettingsRow: { create: { tenantId: existing.id } } },
            request,
          });
        } catch (e: any) {
          return NextResponse.json(
            { error: e.message },
            { status: 400 }
          );
        }
      }

      await EventsService.create({
        request,
        event: "account.updated",
        tenantId: tenant.id,
        userId: currentUser.id,
        data: {
          id: tenant.id,
          new: { name, slug },
          old: { name: tenant.name, slug: tenant.slug },
          user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
        } satisfies AccountUpdatedDto,
      });

      await db.tenants.updateTenant(existing, { name, icon, slug, typeIds });

      return NextResponse.json({
        success: t("settings.tenant.updated"),
      });
    } else if (action === "create-stripe-customer") {
      if (!tenant) {
        return NextResponse.json(
          { error: "Invalid tenant" },
          { status: 400 }
        );
      }

      const tenantUsers = await db.tenants.getTenantUsers(params.id);
      if (tenantUsers.length === 0) {
        return NextResponse.json(
          { error: "No users found" },
          { status: 400 }
        );
      }

      const tenantOwner = tenantUsers.find((user) => user.type === TenantUserType.OWNER);
      if (!tenantOwner) {
        return NextResponse.json(
          { error: "No owner found" },
          { status: 400 }
        );
      }

      const tenantSubscription = await db.tenantSubscriptions.getOrPersistTenantSubscription(tenant.id);
      if (tenantSubscription.stripeCustomerId) {
        return NextResponse.json(
          { error: "Stripe Customer already set" },
          { status: 400 }
        );
      }

      const stripeCustomer = await createStripeCustomer(tenantOwner.user.email, tenant.name);
      if (!stripeCustomer) {
        return NextResponse.json(
          { error: "Could not create stripe customer" },
          { status: 400 }
        );
      }

      await db.tenantSubscriptions.updateTenantSubscriptionCustomerId(tenant.id, {
        stripeCustomerId: stripeCustomer.id,
      });

      return NextResponse.json({
        success: "Stripe customer created",
      });
    } else {
      return NextResponse.json(
        { error: t("shared.invalidForm") },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/admin/accounts/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE handler for delete-tenant action
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await verifyUserHasPermission("admin.account.delete");
    const userInfo = await getUserInfo();
    const currentUser = await db.users.getUser(userInfo.userId);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    const params = await context.params;
    const tenant = await db.tenants.getTenant(params.id);
    
    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    await EventsService.create({
      request,
      event: "account.deleted",
      tenantId: null,
      userId: userInfo.userId,
      data: {
        tenant: { id: tenant.id, name: tenant.name },
        user: { id: currentUser.id, email: currentUser.email },
      } satisfies AccountDeletedDto,
    });

    await deleteAndCancelTenant({ tenantId: tenant.id, userId: currentUser.id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/accounts/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
