import type { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { KbRoutesCategoryApi } from "@/modules/knowledgeBase/routes/api/KbRoutes.Category.Api";
import KbRoutesCategoryView from "@/modules/knowledgeBase/routes/views/KbRoutes.Category.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await KbRoutesCategoryApi.loader(props, { kbSlug: "docs" });
  return (data?.metatags as Metadata) || {};
}

export const loader = (props: IServerComponentsProps) => KbRoutesCategoryApi.loader(props, { kbSlug: "docs" });
// export const action = (props: IServerComponentsProps) => KbRoutesCategoryApi.action(props, { kbSlug: "docs" });

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <KbRoutesCategoryView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
