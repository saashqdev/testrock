import { loaderEmails } from "../loaders/inbound-emails";
import InboundEmailsRoute from "../routes/InboundEmailsRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

interface InboundEmailsPageProps {
  tenantId?: string | null;
  children?: React.ReactNode;
}

export default async function InboundEmailsPage({ tenantId = null, children, ...props }: InboundEmailsPageProps & IServerComponentsProps) {
  // Load data on the server
  const data = await loaderEmails(props, tenantId);

  return <InboundEmailsRoute data={data} children={children} />;
}
