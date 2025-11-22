import { redirect } from "next/navigation";
import UrlUtils from "@/utils/app/UrlUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function ApiKeyRedirectRoute(props: IServerComponentsProps) {
  const params = await props.params;
  if (!params) {
    throw new Error("Missing required params");
  }
  const id = params.id;
  
  // Redirect to the correct path with /keys/ in the URL
  redirect(UrlUtils.currentTenantUrl(params, `settings/api/keys/${id}`));
}
