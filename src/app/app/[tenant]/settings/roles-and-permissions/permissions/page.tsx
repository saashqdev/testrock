import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import PermissionsComponent from "./component";

type LoaderData = {
  title: string;
  items: PermissionsWithRolesDto[];
};

async function getPermissionsData(props: IServerComponentsProps): Promise<LoaderData> {
  await requireAuth();
  const { t } = await getServerTranslations();

  const items = await db.permissions.getAllPermissions("app");

  const data: LoaderData = {
    title: `${t("models.permission.plural")} | ${process.env.APP_NAME}`,
    items,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await getPermissionsData(props);
  return {
    title: data.title,
  };
}

export default async function PermissionsRoute(props: IServerComponentsProps) {
  const data = await getPermissionsData(props);

  return <PermissionsComponent items={data.items} />;
}
