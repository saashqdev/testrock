import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import { getPlanFeatureUsage } from "@/utils/services/server/subscriptionService";
import { Entity } from "@prisma/client";
import { getBaseURL } from "../../url.server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { db } from "@/db";

export type GetEntityData = {
  entity: EntityWithDetailsDto;
  featureUsageEntity?: PlanFeatureUsageDto | undefined;
};
export type Routes = {
  list?: string;
  new?: string;
  overview?: string;
  edit?: string;
  publicUrl?: string;
  import?: string;
  export?: string;
  group?: string;
};
export async function get({ entity, tenantId, userId }: { entity: { id?: string; name?: string }; tenantId?: string | null; userId?: string }) {
  const item = await db.entities.getEntityByIdOrName({ tenantId, ...entity });

  const featureUsageEntity = tenantId ? await getPlanFeatureUsage(tenantId, item.name) : undefined;
  await fillSystemProperties({ entity: item, tenantId, userId });
  const data: GetEntityData = {
    entity: item,
    featureUsageEntity,
  };
  return data;
}
export async function validateEntity({
  tenantId,
  name,
  slug,
  order,
  prefix,
  entity,
}: {
  tenantId: string | null;
  name: string;
  slug: string;
  order: number | null;
  prefix: string;
  entity?: Entity;
}) {
  const errors: string[] = [];

  if (!entity || entity?.name !== name) {
    const existingName = await db.entities.findEntityByName({ tenantId, name });
    if (existingName) {
      errors.push(`Existing entity with name '${name}': ${existingName.slug}`);
    }
  }

  if (!entity || entity?.slug !== slug) {
    const existingSlug = await db.entities.findEntityBySlug(slug);
    if (existingSlug) {
      errors.push(`Existing entity with slug '${slug}': ${existingSlug.slug}`);
    }
  }

  // if (order) {
  //   if (!entity || entity?.order !== order) {
  //     const existingOrder = await getEntityByOrder(order);
  //     if (existingOrder) {
  //       errors.push(`Existing entity with order '${order}':  ${existingOrder.slug}`);
  //     }
  //   }
  // }

  if (!entity || entity?.prefix !== prefix) {
    const existingPrefix = await db.entities.getEntityByPrefix(prefix);
    if (existingPrefix) {
      errors.push(`Existing entity with prefix '${prefix}': ${existingPrefix.slug}`);
    }
  }

  return errors;
}
export function getNoCodeRoutes({ request, params }: { request?: Request; params: { group?: string; tenant?: string } }): Routes {
  const url = request ? new URL(request.url) : null;
  const pathname = url?.pathname;
  
  // Check if admin context via query parameter or referer header
  const isAdminContext = url?.searchParams.get('admin') === 'true' || 
                        request?.headers.get('referer')?.includes('/admin/');

  if (params.group) {
    if (pathname?.startsWith(`/admin/g`)) {
      const routes: Routes = {
        list: `/admin/g/${params.group}/:entity`,
        new: `/admin/g/${params.group}/:entity/new`,
        overview: `/admin/g/${params.group}/:entity/:id`,
        edit: `/admin/g/${params.group}/:entity/:id/edit`,
        import: `/admin/g/${params.group}/:entity/import`,
        export: `/admin/g/${params.group}/:entity/export`,
        publicUrl: getBaseURL() + `/public/:entity/:id`,
        group: `/admin/g/${params.group}`,
      };
      return routes;
    } else if (pathname?.startsWith(`/app/${params.tenant}/g`)) {
      const routes: Routes = {
        list: `/app/${params?.tenant}/g/${params.group}/:entity`,
        new: `/app/${params?.tenant}/g/${params.group}/:entity/new`,
        overview: `/app/${params?.tenant}/g/${params.group}/:entity/:id`,
        edit: `/app/${params?.tenant}/g/${params.group}/:entity/:id/edit`,
        import: `/app/${params?.tenant}/g/${params.group}/:entity/import`,
        export: `/app/${params?.tenant}/g/${params.group}/:entity/export`,
        publicUrl: getBaseURL() + `/public/:entity/:id`,
        group: `/app/${params?.tenant}/g/${params.group}`,
      };
      return routes;
    }
  } else if (pathname?.startsWith(`/admin/xrm`)) {
    const routes: Routes = {
      list: `/admin/xrm/:entity`,
      new: `/admin/xrm/:entity/new`,
      overview: `/admin/xrm/:entity/:id`,
      edit: `/admin/xrm/:entity/:id/edit`,
      import: `/admin/xrm/:entity/import`,
      export: `/admin/xrm/:entity/export`,
      publicUrl: getBaseURL() + `/public/:entity/:id`,
    };
    return routes;
  } else if (pathname?.startsWith(`/admin/crm`)) {
    const routes: Routes = {
      list: `/admin/crm/:entity`,
      new: `/admin/crm/:entity/new`,
      overview: `/admin/crm/:entity/:id`,
      edit: `/admin/crm/:entity/:id/edit`,
      import: `/admin/crm/:entity/import`,
      export: `/admin/crm/:entity/export`,
      publicUrl: getBaseURL() + `/public/:entity/:id`,
    };
    return routes;
  } else if (pathname?.startsWith("/admin/")) {
    const routes: Routes = {
      list: `/admin/entities/:entity/no-code/:entity`,
      new: `/admin/entities/:entity/no-code/:entity/new`,
      overview: `/admin/entities/:entity/no-code/:entity/:id`,
      edit: `/admin/entities/:entity/no-code/:entity/:id/edit`,
      import: `/admin/entities/:entity/no-code/:entity/import`,
      export: `/admin/entities/:entity/no-code/:entity/export`,
      publicUrl: getBaseURL() + `/public/:entity/:id`,
    };
    return routes;
  } else if (pathname?.startsWith(`/app/${params?.tenant}/crm`)) {
    const routes: Routes = {
      list: `/app/${params?.tenant}/crm/:entity`,
      new: `/app/${params?.tenant}/crm/:entity/new`,
      overview: `/app/${params?.tenant}/crm/:entity/:id`,
      edit: `/app/${params?.tenant}/crm/:entity/:id/edit`,
      import: `/app/${params?.tenant}/crm/:entity/import`,
      export: `/app/${params?.tenant}/crm/:entity/export`,
      publicUrl: getBaseURL() + `/public/:entity/:id`,
    };
    return routes;
  }
  
  // If admin context detected but not a special path, use admin entity routes
  if (isAdminContext) {
    const routes: Routes = {
      list: `/admin/entities/:entity/no-code/:entity`,
      new: `/admin/entities/:entity/no-code/:entity/new`,
      overview: `/admin/entities/:entity/no-code/:entity/:id`,
      edit: `/admin/entities/:entity/no-code/:entity/:id/edit`,
      import: `/admin/entities/:entity/no-code/:entity/import`,
      export: `/admin/entities/:entity/no-code/:entity/export`,
      publicUrl: getBaseURL() + `/public/:entity/:id`,
    };
    return routes;
  }
  
  const routes: Routes = {
    list: `/app/${params?.tenant}/:entity`,
    new: `/app/${params?.tenant}/:entity/new`,
    overview: `/app/${params?.tenant}/:entity/:id`,
    edit: `/app/${params?.tenant}/:entity/:id/edit`,
    import: `/app/${params?.tenant}/:entity/import`,
    export: `/app/${params?.tenant}/:entity/export`,
    publicUrl: getBaseURL() + `/public/:entity/:id`,
  };
  return routes;
}
export async function fillSystemProperties({
  entity,
  tenantId,
  userId,
}: {
  entity: EntityWithDetailsDto;
  tenantId: string | null | undefined;
  userId: string | undefined;
}) {
  // const userProp = entity.properties.find((f) => f.name === "user");
  // if (userProp) {
  //   const users = await adminGetAllUsersNames();
  //   userProp.options = users.map((f) => ({
  //     value: f.email,
  //     name: f.email,
  //   })) as PropertyOption[];
  // }
}

