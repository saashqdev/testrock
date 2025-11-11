import { InboundEmails_List } from "../InboundEmails_List";

export namespace InboundEmailsListApi {
  export type LoaderData = InboundEmails_List.LoaderData;
  export type ActionData = InboundEmails_List.ActionData;
  
  export const loader = InboundEmails_List.loader;
  export const action = InboundEmails_List.action;
  
  export async function generateMetadata({ params }: { params: { tenant?: string } }) {
    return {
      title: `Inbound Emails | ${process.env.APP_NAME}`,
    };
  }
}
