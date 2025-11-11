import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import EmailMarketingSummaryRoute from "@/modules/emailMarketing/components/EmailMarketingSummaryRoute";
import { EmailMarketing_Summary } from "@/modules/emailMarketing/routes/EmailMarketing_Summary";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await EmailMarketing_Summary.loader(props);
  return {
    title: data?.title,
  };
}

export default async function EmailMarketingPage(props: IServerComponentsProps) {
  const data = await EmailMarketing_Summary.loader(props);
  return <EmailMarketingSummaryRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
