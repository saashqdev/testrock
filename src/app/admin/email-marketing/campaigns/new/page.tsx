import CampaignsNewRoute from "@/modules/emailMarketing/components/campaigns/CampaignsNewRoute";
import { Campaigns_New } from "@/modules/emailMarketing/routes/Campaigns_New";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function CampaignsNewPage(props: IServerComponentsProps) {
  const data = await Campaigns_New.loader(props);
  
  async function submitAction(prev: any, formData: FormData): Promise<Campaigns_New.ActionData> {
    "use server";
    const request = new Request("http://localhost", { 
      method: "POST", 
      body: formData 
    });
    const response = await Campaigns_New.action({ ...props, request });
    if (response instanceof Response) {
      return await response.json();
    }
    return response as Campaigns_New.ActionData;
  }
  
  return <CampaignsNewRoute data={data} action={submitAction} />;
}
