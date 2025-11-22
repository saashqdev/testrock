import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { getServerTranslations } from "@/i18n/server";
import { PricingBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockUtils";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import { load, subscribe } from "@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PricingClient from "./PricingClient";

type LoaderData = {
  metatags: MetaTagsDto;
  pricingData: PricingBlockDto["data"];
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: `${t("front.pricing.title")} | ${process.env.APP_NAME}`,
    description: t("front.pricing.headline"),
  };
}

const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const searchParams = await props.searchParams;
  const { t } = await getServerTranslations();
  
  const pricingData = await load({ searchParams });
  const data: LoaderData = {
    metatags: [{ title: `${t("front.pricing.title")} | ${process.env.APP_NAME}` }, { name: "description", content: t("front.pricing.headline") }],
    pricingData,
  };
  return data;
};

export async function actionPricing(prev: any, formData: FormData) {
  "use server";
  const { t } = await getServerTranslations();
  const action = formData.get("action");
  if (action === "subscribe") {
    try {
      const response = await subscribe({ form: formData, t });
      return response;
    } catch (error: any) {
      return { error: error.message || "An error occurred" };
    }
  }
  return { error: "Invalid action" };
}

export default async function (props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await loader(props);

  return (
    <div>
      <HeaderBlock />
      <div className="py-4">
        <HeadingBlock
          item={{
            style: "centered",
            headline: t("front.pricing.title"),
            subheadline: t("front.pricing.headline"),
          }}
        />
      </div>

      <PricingClient data={data} action={actionPricing} />

      <FooterBlock />
    </div>
  );
}
