import { getServerTranslations } from "@/i18n/server";
import { loader } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";

export async function generateMetadata(props: IServerComponentsProps) {
  const data = await loader(props);
  return getMetaTags({
    title: data?.title || defaultSiteTags.title,
  });
}

export default async (props: IServerComponentsProps) => {
  const data = await loader(props);
  return <Component data={data} />;
};
