export type { LoaderData, ActionData } from "../InboundEmails_List";
export { loader, action } from "../InboundEmails_List";

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `Inbound Emails | ${process.env.APP_NAME}`,
  };
}

