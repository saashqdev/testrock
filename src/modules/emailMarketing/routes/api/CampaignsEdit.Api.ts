import { Campaigns_Edit } from "../Campaigns_Edit";

export namespace CampaignsEditApi {
  export type LoaderData = Campaigns_Edit.LoaderData;
  export type ActionData = Campaigns_Edit.ActionData;
  
  export const loader = Campaigns_Edit.loader;
  export const action = Campaigns_Edit.action;
  
  export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
    return {
      title: `Edit Campaign | ${process.env.APP_NAME}`,
    };
  }
}
