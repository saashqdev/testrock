"use client";

import CampaignsNewRoute from "../../components/campaigns/CampaignsNewRoute";
import { LoaderData, ActionData } from "../Campaigns_New";

interface CampaignsNewViewProps {
  data: LoaderData;
  action: (prev: any, formData: FormData) => Promise<ActionData>;
}

export default function CampaignsNewView({ data, action }: CampaignsNewViewProps) {
  return <CampaignsNewRoute data={data} action={action} />;
}
