import { Metadata } from "next";
import CampaignsNewView from "@/modules/emailMarketing/routes/views/CampaignsNew.View";
import { ActionData, loader, action, generateMetadata as generateCampaignMetadata } from "@/modules/emailMarketing/routes/api/CampaignsNew.Api";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return generateCampaignMetadata({ params: resolvedParams });
}

export default async function CampaignsNewPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/email-marketing/campaigns/new`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  const request = new Request(url.toString());
  const data = await loader({
    request,
    params,
  });

  // Server action wrapper
  async function handleAction(prev: any, formData: FormData): Promise<ActionData> {
    "use server";
    const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/email-marketing/campaigns/new`);
    const request = new Request(url.toString(), {
      method: "POST",
      body: formData,
    });
    const response = await action({ request, params });

    // Handle redirect responses
    if (response instanceof Response && response.status === 302) {
      throw response; // Let Next.js handle the redirect
    }

    // Extract JSON from Response
    if (response instanceof Response) {
      return await response.json();
    }

    return response;
  }

  return <CampaignsNewView data={data} action={handleAction} />;
}
