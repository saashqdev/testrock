import EmailMarketingSummaryRoute from "@/modules/emailMarketing/components/EmailMarketingSummaryRoute";
import { loader } from "../api/EmailMarketingSummary.Api";

type Props = {
  params: { tenant: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function EmailMarketingSummaryView({ params, searchParams }: Props) {
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${params.tenant}/email-marketing`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
      }
    });
  }
  
  const request = new Request(url.toString());
  const data = await loader({ 
    request, 
    params: Promise.resolve(params)
  });

  return <EmailMarketingSummaryRoute data={data} />;
}