import InboundEmailsPage from "@/modules/emails/pages/InboundEmailsPage";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

/**
 * Example Next.js App Router page
 * Place this file at: app/(app)/emails/inbound/page.tsx
 * or wherever you want the inbound emails route to be
 */
export default async function Page(props: IServerComponentsProps) {
  return <InboundEmailsPage {...props} tenantId={null} />;
}
