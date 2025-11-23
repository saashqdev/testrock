import EmailMarketingSummaryRoute from "@/modules/emailMarketing/components/EmailMarketingSummaryRoute";
import { loader } from "../api/EmailMarketingSummary.Api";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function EmailMarketingSummaryAdminView({ searchParams }: Props) {
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/admin/email-marketing`);
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
    params: Promise.resolve({}),
  });

  return <EmailMarketingSummaryRoute data={data} />;
}
