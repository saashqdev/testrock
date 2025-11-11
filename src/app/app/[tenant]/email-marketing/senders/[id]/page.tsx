import { Metadata } from "next";
import SendersEditView from "@/modules/emailMarketing/routes/views/SendersEdit.View";
import { SendersEditApi } from "@/modules/emailMarketing/routes/api/SendersEdit.Api";

type Props = {
  params: Promise<{ tenant: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return SendersEditApi.generateMetadata({ params: resolvedParams });
}

export default async function SendersEditPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/email-marketing/senders/${resolvedParams.id}`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  const request = new Request(url.toString());
  const data = await SendersEditApi.loader({ 
    request, 
    params 
  });
  
  return <SendersEditView data={data} />;
}
