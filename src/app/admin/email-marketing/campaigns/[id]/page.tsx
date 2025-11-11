import CampaignsEditRoute from "@/modules/emailMarketing/components/campaigns/CampaignsEditRoute";
import { Campaigns_Edit } from "@/modules/emailMarketing/routes/Campaigns_Edit";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function CampaignsEditPage(props: IServerComponentsProps) {
  const data = await Campaigns_Edit.loader(props);
  return <CampaignsEditRoute data={data} />;
}
