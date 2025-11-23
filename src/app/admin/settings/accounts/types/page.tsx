import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const siteTags = getDefaultSiteTags();
  return {
    title: `Tenant Types | ${siteTags.title}`,
  };
}

export default async function (props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.accountTypes.view");
  return <Component>{props.children}</Component>;
}
