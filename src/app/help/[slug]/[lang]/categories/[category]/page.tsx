import type { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/knowledgeBase/routes/api/KbRoutes.Category.Api";
import KbRoutesCategoryView from "@/modules/knowledgeBase/routes/views/KbRoutes.Category.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props, { kbSlug: "help" });
  return (data?.metatags as Metadata) || {};
}

export const loader = (props: IServerComponentsProps) => loader(props);
// export const action = (props: IServerComponentsProps) => KbRoutesCategoryApi.action(props, { kbSlug: "help" });

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <KbRoutesCategoryView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
