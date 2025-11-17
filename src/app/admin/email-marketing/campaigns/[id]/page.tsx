import CampaignsEditRoute from "@/modules/emailMarketing/components/campaigns/CampaignsEditRoute";
import { loader } from "@/modules/emailMarketing/routes/Campaigns_Edit";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function CampaignsEditPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <CampaignsEditRoute data={data} />;
}
