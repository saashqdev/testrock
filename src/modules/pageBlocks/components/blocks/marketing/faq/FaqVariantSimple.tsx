"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaqBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/faq/FaqBlockUtils";
import { useRootData } from "@/lib/state/useRootData";
import AnalyticsHelper from "@/lib/helpers/AnalyticsHelper";

export default function FaqVariantSimple({ item }: { item: FaqBlockDto }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const rootData = useRootData();
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
        {item.headline && <h2 className="mx-auto mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t(item.headline)}</h2>}
        {item.subheadline && <p className="mx-auto text-center text-xl">{t(item.subheadline)}</p>}
      </div>
      <Accordion type="single" collapsible>
        {item.items.map((item, index) => (
          <AccordionItem key={index} value={"item-" + (index + 1)}>
            <AccordionTrigger
              className="text-base"
              onClick={() => {
                AnalyticsHelper.addEvent({
                  url: pathname,
                  route: pathname, // In App Router, we'll use pathname as route ID
                  rootData: {
                    userSession: rootData.userSession,
                    appConfiguration: {
                      ...rootData.appConfiguration,
                      app: {
                        ...rootData.appConfiguration.app,
                        theme: {
                          color: rootData.theme.color,
                          scheme: rootData.theme.scheme as "light" | "dark" | "system",
                        },
                      },
                    },
                  },
                  action: "click",
                  category: "faq",
                  label: item.question,
                  value: "",
                });
              }}
            >
              {t(item.question)}
            </AccordionTrigger>
            <AccordionContent className="text-base">
              {t(item.answer)}{" "}
              {item.link && (
                <Link href={item.link.href} className="mt-1 inline-flex items-center font-medium text-primary underline">
                  {t(item.link.text)}
                </Link>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
