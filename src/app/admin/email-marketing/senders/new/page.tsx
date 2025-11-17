import SendersNewRoute from "@/modules/emailMarketing/components/senders/SendersNewRoute";
import { loader } from "@/modules/emailMarketing/routes/Senders_New";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SendersNewPage(props: IServerComponentsProps) {
  await loader(props);
  return <SendersNewRoute />;
}
