import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace WorkflowEngineApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    children?: React.ReactNode;
  };

  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const appConfiguration = await db.appConfiguration.getAppConfiguration();
    if (params.tenant && !appConfiguration.app.features.tenantWorkflows) {
      throw Response.json({ error: "Workflows are disabled" }, { status: 400 });
    }
    const data: LoaderData = {
      metatags: [{ title: `Workflows | ${process.env.APP_NAME}` }],
      children: props.children,
    };
    return data;
  };
}
