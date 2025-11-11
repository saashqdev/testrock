import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  return getMetaTags({
    title: `Tenant Types | ${defaultSiteTags.title}`,
  });
}

export default async function (props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.accountTypes.view");
  return <Component>{props.children}</Component>;
}
