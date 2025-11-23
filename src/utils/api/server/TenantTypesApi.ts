import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { db } from "@/db";

export async function setTenantTypes({
  tenantId,
  subscriptionProduct,
  types,
}: {
  tenantId: string;
  subscriptionProduct?: SubscriptionProductDto;
  types?: string[];
}) {
  const tenant = await db.tenants.getTenant(tenantId);
  if (!tenant) {
    return;
  }
  if (types) {
    await Promise.all(
      types.map(async (typeId) => {
        await db.tenants.addTenantTypeToTenant(tenant.id, { typeId });
      })
    );
    return;
  }
  const defaultTenantTypes = await db.tenantTypes.getDefaultTenantTypes();
  const allTenantTypes = [...defaultTenantTypes, ...(subscriptionProduct?.assignsTenantTypes ?? [])].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  );
  await Promise.all(
    allTenantTypes.map(async (tenantType) => {
      if (!tenant.types.find((f) => f.id === tenantType.id)) {
        await db.tenants.addTenantTypeToTenant(tenant.id, {
          typeId: tenantType.id,
        });
      }
    })
  );
}
// export async function filterEntities({
//   tenant,
//   entities,
//   entityGroups,
// }: {
//   tenant: TenantDto;
//   entities: EntityWithDetailsDto[];
//   entityGroups?: EntityGroupWithDetailsDto[];
// }) {
//   const tenantTypes = await db.tenantTypes.getAllTenantTypes();
//   if (tenantTypes.length > 0) {
//     const tenantEntities = await TenantEntitiesApi.getEntities({ inTypes: tenant.types, enabledOnly: true });
//     entities = tenantEntities.allEntities;
//     let newGroups: EntityGroupWithDetailsDto[] = [];
//     entityGroups?.forEach((group) => {
//       group.entities = group.entities.filter((f) => entities.some((e) => e.id === f.id));
//       if (group.entities.length > 0) {
//         newGroups.push(group);
//       }
//     });
//     entityGroups = newGroups;
//   }
// }
