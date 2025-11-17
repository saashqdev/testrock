import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import OutboundEmailsListRoute from "@/modules/emailMarketing/components/outboundEmails/OutboundEmailsListRoute";
import { loader } from "@/modules/emailMarketing/routes/OutboundEmails_List";

export default async function ActivityPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <OutboundEmailsListRoute data={data} />;
}
