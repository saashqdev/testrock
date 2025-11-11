import { Campaigns_List } from "../Campaigns_List";

export namespace CampaignsListApi {
  export type LoaderData = Campaigns_List.LoaderData;
  
  export const loader = Campaigns_List.loader;
  
  export async function generateMetadata({ params }: { params: { tenant?: string } }) {
    return {
      title: `Campaigns | ${process.env.APP_NAME}`,
    };
  }
}