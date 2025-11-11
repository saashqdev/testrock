"use client";

import CampaignsListRoute from "../../components/campaigns/CampaignsListRoute";
import { Campaigns_List } from "../Campaigns_List";

interface CampaignsListViewProps {
  data: Campaigns_List.LoaderData;
}

export default function CampaignsListView({ data }: CampaignsListViewProps) {
  return <CampaignsListRoute data={data} />;
}