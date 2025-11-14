import { getServerTranslations } from "@/i18n/server";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Metadata } from "next";
import AccountUsersView from "./account-users-view";

export namespace AccountUsers {
  export type LoaderData = {
    title: string;
    tenants: TenantWithDetailsDto[];
  };

  export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
    await verifyUserHasPermission("admin.roles.update");
    const { t } = await getServerTranslations();

    const tenants = await db.tenants.adminGetAllTenants();

    const data: LoaderData = {
      title: `${t("models.permission.userRoles")} | ${process.env.APP_NAME}`,
      tenants,
    };
    return data;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.permission.userRoles")} | ${process.env.APP_NAME}`,
  };
}

export default async function AdminRolesAndPermissionsAccountUsersRoute(props: IServerComponentsProps) {
  const data = await AccountUsers.loader(props);

  return <AccountUsersView tenants={data.tenants} />;
}
