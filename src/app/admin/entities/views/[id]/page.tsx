import { redirect } from "next/navigation";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { UserWithNamesDto } from "@/db/models/accounts/UsersModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import EntityViewClient from "../EntityViewClient";
import { db } from "@/db";

type LoaderData = {
  item: EntityViewsWithTenantAndUserDto;
  allTenants: TenantWithDetailsDto[];
  allUsers: UserWithNamesDto[];
};

export default async function EntityViewPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const item = await db.entityViews.getEntityViewWithTenantAndUser(params.id ?? "");
  if (!item) {
    redirect(`/admin/entities/views`);
  }

  const data: LoaderData = {
    item,
    allTenants: await db.tenants.adminGetAllTenants(),
    allUsers: await db.users.adminGetAllUsersNames(),
  };

  return <EntityViewClient data={data} />;
}
