import CampaignsNewRoute from "@/modules/emailMarketing/components/campaigns/CampaignsNewRoute";
import { loader, ActionData, action } from "@/modules/emailMarketing/routes/Campaigns_New";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function CampaignsNewPage(props: IServerComponentsProps) {
  const data = await loader(props);
  
  async function submitAction(prev: any, formData: FormData): Promise<ActionData> {
    "use server";
    const request = new Request("http://localhost", { 
      method: "POST", 
      body: formData 
    });
    const response = await action({ ...props, request });
    if (response instanceof Response) {
      return await response.json();
    }
    return response as ActionData;
  }
  
  return <CampaignsNewRoute data={data} action={submitAction} />;
}
