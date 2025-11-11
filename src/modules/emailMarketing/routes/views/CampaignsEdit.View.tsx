"use client";

import CampaignsEditRoute from "../../components/campaigns/CampaignsEditRoute";
import { Campaigns_Edit } from "../Campaigns_Edit";

interface CampaignsEditViewProps {
  data: Campaigns_Edit.LoaderData;
  action: (prev: any, formData: FormData) => Promise<Campaigns_Edit.ActionData>;
}

export default function CampaignsEditView({ data, action }: CampaignsEditViewProps) {
  return <CampaignsEditRoute data={data} />;
}
