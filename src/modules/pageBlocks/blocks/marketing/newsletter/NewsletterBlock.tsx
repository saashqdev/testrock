"use client";

import { NewsletterBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/newsletter/NewsletterBlockUtils";
import NewsletterVariantSimple from "./NewsletterVariantSimple";

export default function NewsletterBlock({ item }: { item: NewsletterBlockDto }) {
  return (
    <>
      {item.style === "simple" && <NewsletterVariantSimple item={item} />}
    </>
  );
}
