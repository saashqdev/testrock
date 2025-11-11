import InboundEmailsPage from "@/modules/emails/pages/InboundEmailsPage";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

/**
 * Example Next.js App Router page with tenant context
 * Place this file at: app/(app)/[tenant]/emails/inbound/page.tsx
 */
export default async function TenantInboundEmailsPage(props: IServerComponentsProps) {
  const params = await props.params;
  const tenantId = params?.tenant as string;
  
  return <InboundEmailsPage {...props} tenantId={tenantId} />;
}
