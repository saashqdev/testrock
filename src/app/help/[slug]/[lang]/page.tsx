import type { Metadata } from "next";
import KbRoutesIndex from "@/modules/knowledgeBase/routes/views/KbRoutes.Index.View";
import { KbRoutesIndexApi } from "@/modules/knowledgeBase/routes/api/KbRoutes.Index.Api";
import ServerError from "@/components/ui/errors/ServerError";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await KbRoutesIndexApi.loader(props, { kbSlug: "help" });
  return (data?.metatags as Metadata) || {};
}

export const loader = (props: IServerComponentsProps) => KbRoutesIndexApi.loader(props);
// export const action = (args: ActionFunctionArgs) => KbRoutesIndexApi.action(args);

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <KbRoutesIndex data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
