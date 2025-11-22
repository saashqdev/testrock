import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { loader } from "./Newsletter.server";
import NewsletterClient from "./component";
import ServerError from "@/components/ui/errors/ServerError";
import { toClientData } from "@/modules/pageBlocks/dtos/PageBlockData";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const metatag = data.metatags?.[0];
  return {
    title: metatag?.title || "Newsletter",
    description: metatag?.description,
  };
}

export default async function NewsletterPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <NewsletterClient data={toClientData(data) as any} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
