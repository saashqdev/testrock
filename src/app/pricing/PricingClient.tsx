"use client";
import PricingVariantSimple from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingVariantSimple";
import { PricingBlockData } from "@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockDto";

interface PricingClientProps {
  pricingData: PricingBlockData;
}

export default function PricingClient({ pricingData }: PricingClientProps) {
  return (
    <PricingVariantSimple
      item={{
        style: "simple",
        allowCoupons: true,
        contactUs: {
          title: "pricing.contactUs",
          description: "pricing.customPlanDescription",
          features: ["+12 users", "Unlimited API calls", "Priority support"],
        },
        data: pricingData,
      }}
    />
  );
}
