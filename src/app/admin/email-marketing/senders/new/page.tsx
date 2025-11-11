import SendersNewRoute from "@/modules/emailMarketing/components/senders/SendersNewRoute";
import { Senders_New } from "@/modules/emailMarketing/routes/Senders_New";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SendersNewPage(props: IServerComponentsProps) {
  await Senders_New.loader(props);
  return <SendersNewRoute />;
}
