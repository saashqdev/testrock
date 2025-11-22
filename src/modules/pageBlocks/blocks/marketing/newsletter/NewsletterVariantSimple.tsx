"use client";

import { useTranslation } from "react-i18next";
import { NewsletterBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/newsletter/NewsletterBlockUtils";
import NewsletterComponent from "./NewsletterComponent";

export default function NewsletterVariantSimple({ item }: { item: NewsletterBlockDto }) {
  const { t } = useTranslation();
  return (
    <div>
      <section className="body-font">
        <div className="container mx-auto space-y-8 px-5 py-24 sm:space-y-12">
          <div className="space-y-5 text-center sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            {item.headline && <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
            {item.subheadline && <p className="mx-auto max-w-3xl text-center text-xl">{t(item.subheadline)}</p>}
          </div>
          <NewsletterComponent />
        </div>
      </section>
    </div>
  );
}
