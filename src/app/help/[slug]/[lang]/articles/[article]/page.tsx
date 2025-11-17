import type { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader, action } from "@/modules/knowledgeBase/routes/api/KbRoutes.Article.Api";
import KbRoutesArticleView from "@/modules/knowledgeBase/routes/views/KbRoutes.Article.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props, { kbSlug: "help" });
  return (data?.metatags as Metadata) || {};
}

export const loader = (props: IServerComponentsProps) => loader(props);
export const action = (props: IServerComponentsProps) => action(props);

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <KbRoutesArticleView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
