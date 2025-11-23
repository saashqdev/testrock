import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  return defaultSeoMetaTags({
    title: `Tenant Types | ${getDefaultSiteTags.title}`,
  });
}

export default async function (props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.accountTypes.view");
  return <Component>{props.children}</Component>;
}
