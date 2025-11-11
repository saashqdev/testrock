"use client";

import { useSearchParams } from "next/navigation";
import { PricingBlockDto } from "./PricingBlockUtils";
import PricingVariantSimple from "./PricingVariantSimple";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function PricingBlock({ item }: { item: PricingBlockDto }) {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  return <>{item.style === "simple" && <PricingVariantSimple item={item} />}</>;
}
