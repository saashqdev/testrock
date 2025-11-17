import PageSettingsRouteIndex from "@/modules/pageBlocks/components/pages/PageSettingsRouteIndex";
import { loader as pageSettingsLoader, action as pageSettingsAction } from "@/modules/pageBlocks/routes/pages/PageSettings_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SettingsPage(props: IServerComponentsProps) {
  const data = await pageSettingsLoader(props);
  
  async function updatePageAction(formData: FormData): Promise<void> {
    "use server";
    const mockRequest = {
      formData: async () => formData,
    };
    await pageSettingsAction({ 
      ...props, 
      request: mockRequest as any 
    });
  }
  
  async function deletePageAction(formData: FormData): Promise<void> {
    "use server";
    const mockRequest = {
      formData: async () => formData,
    };
    await pageSettingsAction({ 
      ...props, 
      request: mockRequest as any 
    });
  }
  
  return <PageSettingsRouteIndex data={data} updatePageAction={updatePageAction} deletePageAction={deletePageAction} />;
}
