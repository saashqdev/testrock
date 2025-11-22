"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import toast from "react-hot-toast";
import PricingVariantSimple from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingVariantSimple";
import { PricingBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockUtils";

interface PricingClientProps {
  data: {
    pricingData: PricingBlockDto["data"];
  };
  action: (prev: any, formData: FormData) => Promise<any>;
}

export default function PricingClient({ data, action }: PricingClientProps) {
  const [actionData, formAction] = useFormState(action, null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData?.error]);

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
        data: data.pricingData,
      }}
    />
  );
}
