import { Metadata } from "next";
import InboundEmailsListView from "@/modules/emails/routes/views/InboundEmailsList.View";
import { loader, generateMetadata } from "@/modules/emails/routes/api/InboundEmailsList.Api";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return generateMetadata({ params: resolvedParams });
}

export default async function InboundEmailsPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/emails`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  const request = new Request(url.toString());
  const data = await loader({ 
    request, 
    params: Promise.resolve(resolvedParams) 
  });

  return <InboundEmailsListView data={data} />;
}
