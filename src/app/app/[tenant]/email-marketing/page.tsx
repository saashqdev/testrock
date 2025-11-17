import { Metadata } from "next";
import EmailMarketingSummaryView from "@/modules/emailMarketing/routes/views/EmailMarketingSummary.View";
import { generateMetadata } from "@/modules/emailMarketing/routes/api/EmailMarketingSummary.Api";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return generateMetadata({ params: resolvedParams });
}

export default async function EmailMarketingPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <EmailMarketingSummaryView 
      params={resolvedParams} 
      searchParams={resolvedSearchParams} 
    />
  );
}