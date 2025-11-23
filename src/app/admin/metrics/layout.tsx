import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";

export async function generateMetadata() {
  return defaultSeoMetaTags({
    title: `Metrics | ${getDefaultSiteTags.title}`,
  });
}

export default async function AdminMetricsLayout({ children }: { children: React.ReactNode }) {
  await verifyUserHasPermission("admin.metrics.view");

  return <>{children}</>;
}
