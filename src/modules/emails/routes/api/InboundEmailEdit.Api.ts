import { InboundEmailEdit } from "../InboundEmailEdit";

export namespace InboundEmailEditApi {
  export type LoaderData = InboundEmailEdit.LoaderData;
  export type ActionData = InboundEmailEdit.ActionData;
  
  export const loader = InboundEmailEdit.loader;
  export const action = InboundEmailEdit.action;
  
  export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
    return {
      title: `Email | ${process.env.APP_NAME}`,
    };
  }
}
