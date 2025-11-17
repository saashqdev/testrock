import type { Metadata } from "next";
import KbRoutesIndex from "@/modules/knowledgeBase/routes/views/KbRoutes.Index.View";
import { loader as kbIndexLoader } from "@/modules/knowledgeBase/routes/api/KbRoutes.Index.Api";
import ServerError from "@/components/ui/errors/ServerError";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await kbIndexLoader(props, { kbSlug: "docs" });
  return (data?.metatags as Metadata) || {};
}

export const loader = (props: IServerComponentsProps) => kbIndexLoader(props, { kbSlug: "docs" });
// export const action = (props: IServerComponentsProps) => KbRoutesIndexApi.action(props);

export default async function Page(props: IServerComponentsProps) {
  const data = await kbIndexLoader(props);
  return <KbRoutesIndex data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
