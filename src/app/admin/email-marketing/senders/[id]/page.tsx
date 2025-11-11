import SendersEditRoute from "@/modules/emailMarketing/components/senders/SendersEditRoute";
import { Senders_Edit } from "@/modules/emailMarketing/routes/Senders_Edit";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SendersEditPage(props: IServerComponentsProps) {
  const data = await Senders_Edit.loader(props);
  return <SendersEditRoute data={data} />;
}
