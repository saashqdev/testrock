import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NewPermission } from "./new.server";
import NewPermissionView from "./new";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await import("@/i18n/server").then((mod) => mod.getServerTranslations());
  return {
    title: `${t("models.permission.object")} | ${process.env.APP_NAME}`,
  };
}

export default async function NewPermissionPage(props: IServerComponentsProps) {
  const data = await NewPermission.loader(props);
  return <NewPermissionView roles={data.roles} />;
}
