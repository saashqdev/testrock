"use client";

import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import PricingClient from "./PricingClient";
import { PricingBlockData } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockUtils";

interface PricingPageProps {
  pricingData: PricingBlockData;
}

export default function PricingPage({ pricingData }: PricingPageProps) {
  const { t } = useTranslation();

  // Memoize the pricing data to prevent unnecessary re-renders
  const stablePricingData = useMemo(() => pricingData, [pricingData]);

  useEffect(() => {
    // Disable scroll restoration globally
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

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

      <PricingClient pricingData={stablePricingData} />

      <FooterBlock />
    </div>
  );
}
