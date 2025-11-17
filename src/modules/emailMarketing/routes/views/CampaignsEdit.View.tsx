"use client";

import CampaignsEditRoute from "../../components/campaigns/CampaignsEditRoute";
import { LoaderData, ActionData } from "../Campaigns_Edit";

interface CampaignsEditViewProps {
  data: LoaderData;
  action: (prev: any, formData: FormData) => Promise<ActionData>;
}

export default function CampaignsEditView({ data, action }: CampaignsEditViewProps) {
  return <CampaignsEditRoute data={data} />;
}
