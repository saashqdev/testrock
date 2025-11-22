import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { loader, LoaderData } from "./Contact.server";
import ContactClient from "./component";
import ServerError from "@/components/ui/errors/ServerError";

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
  return <ContactClient data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
