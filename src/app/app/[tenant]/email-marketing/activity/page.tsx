import { Metadata } from "next";
import OutboundEmailsListRoute from "@/modules/emailMarketing/components/outboundEmails/OutboundEmailsListRoute";
import { OutboundEmails_List } from "@/modules/emailMarketing/routes/OutboundEmails_List";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: "Email Marketing Activity - " + resolvedParams.tenant,
  };
}

export default async function ActivityPage({ params, searchParams }: Props) {
  const headersList = await headers();
  const fullUrl = headersList.get("x-url") || "";
  
  const data = await OutboundEmails_List.loader({ 
    params,
    searchParams,
    request: new Request(fullUrl || "http://localhost")
  });
  
  return <OutboundEmailsListRoute data={data} />;
}
