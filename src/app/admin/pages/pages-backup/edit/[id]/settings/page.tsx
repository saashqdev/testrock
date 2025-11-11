import PageSettingsRouteIndex from "@/modules/pageBlocks/components/pages/PageSettingsRouteIndex";
import { PageSettings_Index } from "@/modules/pageBlocks/routes/pages/PageSettings_Index";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mockProps = { 
    params: Promise.resolve({ id }), 
    request: new Request("http://localhost") 
  };
  const data = await PageSettings_Index.loader(mockProps);
  
  async function updatePageAction(formData: FormData): Promise<void> {
    "use server";
    const mockRequest = {
      formData: async () => formData,
    };
    await PageSettings_Index.action({ 
      ...mockProps, 
      request: mockRequest as any 
    });
  }
  
  async function deletePageAction(formData: FormData): Promise<void> {
    "use server";
    const mockRequest = {
      formData: async () => formData,
    };
    await PageSettings_Index.action({ 
      ...mockProps, 
      request: mockRequest as any 
    });
  }
  
  return <PageSettingsRouteIndex data={data} updatePageAction={updatePageAction} deletePageAction={deletePageAction} />;
}
