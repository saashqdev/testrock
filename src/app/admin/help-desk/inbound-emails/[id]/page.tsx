import { loaderEmailEdit } from "@/modules/emails/loaders/inbound-email-edit";
import InboundEmailRoute from "@/modules/emails/routes/InboundEmailEditRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";

export const loader = async (props: IServerComponentsProps) => {
  return await loaderEmailEdit(props, null, "/admin/help-desk/inbound-emails");
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data?.item.subject || `Inbound Email | ${process.env.APP_NAME}`,
  };
}

export default InboundEmailRoute;
