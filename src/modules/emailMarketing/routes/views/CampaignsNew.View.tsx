"use client";

import CampaignsNewRoute from "../../components/campaigns/CampaignsNewRoute";
import { Campaigns_New } from "../Campaigns_New";

interface CampaignsNewViewProps {
  data: Campaigns_New.LoaderData;
  action: (prev: any, formData: FormData) => Promise<Campaigns_New.ActionData>;
}

export default function CampaignsNewView({ data, action }: CampaignsNewViewProps) {
  return <CampaignsNewRoute data={data} action={action} />;
}
