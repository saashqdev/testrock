import { Campaigns_New } from "../Campaigns_New";

export namespace CampaignsNewApi {
  export type LoaderData = Campaigns_New.LoaderData;
  export type ActionData = Campaigns_New.ActionData;
  
  export const loader = Campaigns_New.loader;
  export const action = Campaigns_New.action;
  
  export async function generateMetadata({ params }: { params: { tenant?: string } }) {
    return {
      title: `New Campaign | ${process.env.APP_NAME}`,
    };
  }
}
