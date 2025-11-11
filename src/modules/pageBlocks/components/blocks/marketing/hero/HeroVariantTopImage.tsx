"use client";

import Link from "next/link";
import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import ButtonEvent from "@/components/ui/buttons/ButtonEvent";
import { HeroBlockDto } from "@/modules/pageBlocks/components/blocks/marketing/hero/HeroBlockUtils";
import ProductHuntBadge from "../launch/ProductHuntBadge";
import Image from "next/image";

export default function HeroVariantTopImage({ item }: { item: HeroBlockDto }) {
  const { t } = useTranslation();
  return (
    <section className="body-font">
      <div className="container mx-auto flex flex-col items-center justify-center px-5 py-16">
        {item.image && (
          <Image
            className="shadow-2xs mb-10 w-5/6 rounded-lg border-2 border-border object-cover object-center dark:border-gray-600 md:w-3/6"
            alt="hero"
            src={item.image}
          />
        )}
        <div className="w-full text-center lg:w-2/3">
          <div className="mb-4">
            <ProductHuntBadge theme="light" />
            {item.topText && (
              <span className="block text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base lg:text-sm xl:text-base">
                {t(item.topText.text ?? "")}{" "}
                {item.topText.link && (
                  <Link href={item.topText.link.href ?? ""} className="relative font-semibold text-primary">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {t(item.topText.link.text ?? "")} <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </span>
            )}
          </div>
          {item.headline && <h1 className="title-font mb-4 text-3xl font-bold sm:text-4xl md:text-5xl md:font-extrabold">{t(item.headline)}</h1>}
          {item.description && <p className="mb-8 leading-relaxed text-muted-foreground">{t(item.description)}</p>}

          <div className="flex flex-wrap justify-center gap-4">
            {item.cta.map((item, idx) => {
              return (
                <Fragment key={idx}>
                  <ButtonEvent
                    key={idx}
                    event={{ action: "click", category: "hero", label: item.text ?? "", value: item.href ?? "" }}
                    to={item.href}
                    className={clsx(
                      "w-full sm:w-auto",
                      item.isPrimary
                        ? "shadow-2xs focus:outline-hidden inline-flex justify-center rounded-md border-0 bg-primary px-4 py-3 text-lg text-primary-foreground hover:bg-primary/95"
                        : "shadow-2xs focus:outline-hidden inline-flex justify-center rounded-md border-0 bg-secondary px-4 py-3 text-lg text-secondary-foreground hover:bg-secondary/95"
                    )}
                  >
                    {t(item.text)}
                  </ButtonEvent>
                </Fragment>
              );
            })}
          </div>
          <div className="mt-8 space-y-3">
            {item.bottomText && (
              <span>
                {t(item.bottomText.text ?? "")}{" "}
                {item.bottomText.link?.href && (
                  <ButtonEvent
                    to={item.bottomText.link.href ?? ""}
                    target={item.bottomText.link.target}
                    className="text-sm hover:underline"
                    event={{ action: "click", category: "hero", label: item.bottomText.link.text ?? "", value: item.bottomText.link.href ?? "" }}
                  >
                    {t(item.bottomText.link.text ?? "")}
                  </ButtonEvent>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
