import { LoaderData, ActionData, loader, action } from "../InboundEmails_List";

export type LoaderData = LoaderData;
export type ActionData = ActionData;

export const loader = loader;
export const action = action;

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `Inbound Emails | ${process.env.APP_NAME}`,
  };
}

