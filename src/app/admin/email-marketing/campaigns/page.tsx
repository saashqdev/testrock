import CampaignsListRoute from "@/modules/emailMarketing/components/campaigns/CampaignsListRoute";
import { Campaigns_List } from "@/modules/emailMarketing/routes/Campaigns_List";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function CampaignsPage(props: IServerComponentsProps) {
  const data = await Campaigns_List.loader(props);
  return <CampaignsListRoute data={data} />;
}
