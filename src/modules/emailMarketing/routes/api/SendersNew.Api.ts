import { Senders_New } from "../Senders_New";

export namespace SendersNewApi {
  export type LoaderData = Senders_New.LoaderData;
  
  export const loader = Senders_New.loader;
  
  export async function generateMetadata({ params }: { params: { tenant?: string } }) {
    return {
      title: `New Sender | ${process.env.APP_NAME}`,
    };
  }
}
