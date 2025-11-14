import { Metadata } from "next";
import { loaderEmails } from "@/modules/emails/loaders/inbound-emails";
import InboundEmailsRoute from "@/modules/emails/routes/InboundEmailsRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = async (props: IServerComponentsProps) => {
  return await loaderEmails(props, null);
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data?.title,
  };
}

export default async function InboundEmailsPageWrapper(props: IServerComponentsProps) {
  const data = await loader(props);
  return <InboundEmailsRoute data={data} />;
}
