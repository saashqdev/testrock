import { EmailMarketing_Summary } from "../EmailMarketing_Summary";

export namespace EmailMarketingSummaryApi {
  export type LoaderData = EmailMarketing_Summary.LoaderData;
  
  export const loader = EmailMarketing_Summary.loader;
  
  export async function generateMetadata({ params }: { params: { tenant?: string } }) {
    return {
      title: `Email Marketing | ${process.env.APP_NAME}`,
    };
  }
}