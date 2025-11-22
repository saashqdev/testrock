import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { loader, LoaderData } from "./Contact.server";
import ContactClient from "./component";
import ServerError from "@/components/ui/errors/ServerError";
import { toClientData } from "@/modules/pageBlocks/dtos/PageBlockData";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const metatag = data.metatags?.[0];
  return {
    title: metatag?.title || "Contact",
    description: metatag?.description,
  };
}

export default async function ContactPage(props: IServerComponentsProps) {
  const data = await loader(props);
  // Remove non-serializable functions before passing to client component
  return <ContactClient data={toClientData(data) as any} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
