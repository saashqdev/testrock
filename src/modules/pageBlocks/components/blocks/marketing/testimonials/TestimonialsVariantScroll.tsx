"use client";

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { TestimonialsBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/testimonials/TestimonialsBlockUtils";
import TrustpilotBox from "./TrustpilotBox";
import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards";

export default function TestimonialsVariantScroll({ item }: { item: TestimonialsBlockDto }) {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto space-y-6 px-5 py-12 pb-24">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-[500px] w-[500px] rounded-full bg-yellow-500 opacity-20 blur-[150px] dark:opacity-10" />
        </div>
        {(item.headline || item.subheadline) && (
          <div className="space-y-5 pb-8 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline || "")}</h2>
            <p className="text-center text-xl">{t(item.subheadline || "")}</p>
            {item.reviews?.trustpilot && <TrustpilotBox trustpilot={item.reviews?.trustpilot} />}
          </div>
        )}
        <div className="dark:bg-grid-white/[0.05] relative flex flex-col items-center justify-center overflow-hidden rounded-md antialiased">
          <InfiniteMovingCards items={item.items} direction="right" speed="slow" />
        </div>
      </div>
    </section>
  );
}
