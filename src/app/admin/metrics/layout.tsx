import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";

export async function generateMetadata() {
  return getMetaTags({
    title: `Metrics | ${defaultSiteTags.title}`,
  });
}

export default async function AdminMetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyUserHasPermission("admin.metrics.view");
  
  return <>{children}</>;
}
