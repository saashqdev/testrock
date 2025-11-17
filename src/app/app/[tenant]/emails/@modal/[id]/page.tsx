import { Metadata } from "next";
import InboundEmailEditView from "@/modules/emails/routes/views/InboundEmailEdit.View";
import * as InboundEmailEditApi from "@/modules/emails/routes/api/InboundEmailEdit.Api";

type Props = {
  params: Promise<{ tenant: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return InboundEmailEditApi.generateMetadata({ params: resolvedParams });
}

export default async function InboundEmailModalPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Create a mock request object for the loader
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/emails/${resolvedParams.id}`);
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });
  
  const request = new Request(url.toString());
  const data = await InboundEmailEditApi.loader({ 
    request, 
    params: Promise.resolve(resolvedParams) 
  });

  async function actionHandler(prev: any, formData: FormData) {
    "use server";
    const result = await InboundEmailEditApi.action({ 
      request: new Request(url.toString(), { method: "POST", body: formData }), 
      params: Promise.resolve(resolvedParams) 
    });
    
    if (result instanceof Response) {
      return await result.json();
    }
    return result;
  }
  
  return <InboundEmailEditView data={data} action={actionHandler} />;
}
