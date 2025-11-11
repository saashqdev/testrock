import PageSettingsRouteIndex from "@/modules/pageBlocks/components/pages/PageSettingsRouteIndex";
import { PageSettings_Index } from "@/modules/pageBlocks/routes/pages/PageSettings_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => PageSettings_Index.loader(props);
export const action = (props: IServerComponentsProps) => PageSettings_Index.action(props);

export default async function SettingsPage(props: IServerComponentsProps) {
  const data = await PageSettings_Index.loader(props);
  
  async function updatePageAction(formData: FormData): Promise<void> {
    "use server";
    const mockRequest = {
      formData: async () => formData,
    };
    await PageSettings_Index.action({ 
      ...props, 
      request: mockRequest as any 
    });
  }
  
  async function deletePageAction(formData: FormData): Promise<void> {
    "use server";
    const mockRequest = {
      formData: async () => formData,
    };
    await PageSettings_Index.action({ 
      ...props, 
      request: mockRequest as any 
    });
  }
  
  return <PageSettingsRouteIndex data={data} updatePageAction={updatePageAction} deletePageAction={deletePageAction} />;
}
