"use client";

import CampaignsListRoute from "../../components/campaigns/CampaignsListRoute";
import { LoaderData } from "../Campaigns_List";

interface CampaignsListViewProps {
  data: LoaderData;
}

export default function CampaignsListView({ data }: CampaignsListViewProps) {
  return <CampaignsListRoute data={data} />;
}