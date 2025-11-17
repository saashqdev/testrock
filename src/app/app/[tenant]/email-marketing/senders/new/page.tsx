import { Metadata } from "next";
import SendersNewView from "@/modules/emailMarketing/routes/views/SendersNew.View";
import * as SendersNewApi from "@/modules/emailMarketing/routes/api/SendersNew.Api";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return SendersNewApi.generateMetadata({ params: resolvedParams });
}

export default async function SendersNewPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/email-marketing/senders/new`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  const request = new Request(url.toString());
  const data = await SendersNewApi.loader({ 
    request, 
    params 
  });
  
  return <SendersNewView data={data} />;
}
