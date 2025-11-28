import type { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader as kbArticleLoader, action as kbArticleAction } from "@/modules/knowledgeBase/routes/api/KbRoutes.Article.Api";
import KbRoutesArticleView from "@/modules/knowledgeBase/routes/views/KbRoutes.Article.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await kbArticleLoader(props, { kbSlug: "docs" });
  return (data?.metatags as Metadata) || {};
}
export const loader = (props: IServerComponentsProps) => kbArticleLoader(props, { kbSlug: "docs" });
export const action = (props: IServerComponentsProps) => kbArticleAction(props, { kbSlug: "docs" });

export default async function Page(props: IServerComponentsProps) {
  const data = await kbArticleLoader(props, { kbSlug: "docs" });
  return <KbRoutesArticleView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
