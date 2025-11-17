import { redirect } from "next/navigation";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { UserWithNamesDto } from "@/db/models/accounts/UsersModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import NewEntityViewSlideoverWrapper from "../../new/[entity]/NewEntityViewSlideoverWrapper";
import { db } from "@/db";

type LoaderData = {
  allTenants: TenantWithDetailsDto[];
  allUsers: UserWithNamesDto[];
  entity: EntityWithDetailsDto;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.findEntityByName({ tenantId: null, name: params.entity! });
  if (!entity || !entity.hasViews) {
    redirect(`/admin/entities/views`);
  }
  const data: LoaderData = {
    allTenants: await db.tenants.adminGetAllTenants(),
    allUsers: await db.users.adminGetAllUsersNames(),
    entity,
  };
  return data;
}


export default async function InterceptedNewEntityViewPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const searchParams = (await props.searchParams) || {};
  
  return <NewEntityViewSlideoverWrapper data={data} searchParams={searchParams} />;
}
