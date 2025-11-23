import { Metadata } from "next";
import CampaignsListView from "@/modules/emailMarketing/routes/views/CampaignsList.View";
import { loader, generateMetadata as generateCampaignsMetadata } from "@/modules/emailMarketing/routes/api/CampaignsList.Api";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return generateCampaignsMetadata({ params: resolvedParams });
}

export default async function CampaignsPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/email-marketing/campaigns`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  const request = new Request(url.toString());
  const data = await loader({
    request,
    params: params,
  });

  return <CampaignsListView data={data} />;
}
