import { Senders_Edit } from "../Senders_Edit";

export namespace SendersEditApi {
  export type LoaderData = Senders_Edit.LoaderData;
  
  export const loader = Senders_Edit.loader;
  
  export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
    return {
      title: `Edit Sender | ${process.env.APP_NAME}`,
    };
  }
}
