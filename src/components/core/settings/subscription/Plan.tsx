"use client";

import clsx from "clsx";
import { SubscriptionFeatureDto } from "@/lib/dtos/subscriptions/SubscriptionFeatureDto";
import { PricingModel } from "@/lib/enums/subscriptions/PricingModel";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import currencies from "@/lib/pricing/currencies";
import NumberUtils from "@/lib/shared/NumberUtils";
import { SubscriptionPriceDto } from "@/lib/dtos/subscriptions/SubscriptionPriceDto";
import { SubscriptionUsageBasedPriceDto } from "@/lib/dtos/subscriptions/SubscriptionUsageBasedPriceDto";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { useRootData } from "@/lib/state/useRootData";
import AnalyticsHelper from "@/lib/helpers/AnalyticsHelper";
import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import PlanFeatureDescription from "./PlanFeatureDescription";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import { getFormattedPriceInCurrency } from "@/lib/helpers/PricingHelper";
import InputNumber from "@/components/ui/input/InputNumber";

interface Props {
  product?: SubscriptionProductDto;
  title: string;
  description?: string;
  badge?: string;
  features: SubscriptionFeatureDto[];
  billingPeriod: SubscriptionBillingPeriod;
  currency: string;
  model: PricingModel;
  prices: SubscriptionPriceDto[];
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[];
  className?: string;
  alreadyOwned?: boolean;
  canSubmit?: boolean;
  isUpgrade?: boolean;
  isDowngrade?: boolean;
  stripeCoupon: Stripe.Coupon | null;
  isPreview?: boolean;
  onClickFeature?: (name: string) => void;
}

export default function Plan({
  product,
  title,
  description,
  badge,
  features,
  billingPeriod,
  model,
  currency,
  prices,
  usageBasedPrices,
  className,
  alreadyOwned,
  canSubmit,
  isUpgrade,
  isDowngrade,
  stripeCoupon,
  isPreview,
  onClickFeature,
}: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rootData = useRootData();

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [referral, setReferral] = useState<string | null>(null);

  useEffect(() => {
    if (!(typeof window === "undefined") && rootData.appConfiguration.affiliates?.provider.rewardfulApiKey) {
      try {
        // @ts-ignore
        window.rewardful("ready", () => {
          // @ts-ignore
          // eslint-disable-next-line no-console
          // console.log("Rewardful ready", window.Rewardful.referral);
          // @ts-ignore
          setReferral(window.Rewardful.referral);
        });
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.log("Rewardful not found", e);
      }
    }
  }, []);
  // const [usageBasedTiers, setUsageBasedTiers] = useState<{ from: number; to: number | undefined; prices: UsageBasedPriceDto[] }[]>([]);

  // useEffect(() => {
  //   const tiers: { from: number; to: number | undefined; prices: UsageBasedPriceDto[] }[] = [];
  //   usageBasedPrices.forEach((price) => {
  //     const tier = tiers.find((t) => t.from === price.from && t.to === price.to);
  //     if (!tier) {
  //       tiers.push({ from: price.from, to: price.to, prices: [price] });
  //     } else {
  //       tier.prices.push(price);
  //     }
  //   });
  //   setUsageBasedTiers(tiers.sort((a, b) => a.from - b.from));
  // }, [usageBasedPrices]);

  function getCurrencySymbol() {
    return currencies.find((f) => f.value === currency)?.symbol;
  }
  function getCurrency() {
    return currencies.find((f) => f.value === currency)?.value;
  }
  function getFlatPrice(): SubscriptionPriceDto | undefined {
    if (model !== PricingModel.ONCE) {
      return prices.find((f) => f.currency === currency && f.billingPeriod === billingPeriod);
    }
    return prices.find((f) => f.currency === currency && f.billingPeriod === SubscriptionBillingPeriod.ONCE);
  }

  function getFormattedPrice() {
    const price = getFlatPrice();
    if (!price) {
      return "?";
    }
    let total = applyDiscount(Number(price.price || 0));
    return getFormattedPriceInCurrency({
      currency: price.currency,
      price: total,
      decimals: 0,
      withSymbol: false,
    });
  }

  function getCurrencySymbolAt(position: "start" | "end") {
    const currencyDetails = currencies.find((f) => f.value === currency);
    if (!currencyDetails) {
      return "";
    }
    if (currencyDetails.symbolRight) {
      if (position === "start") {
        return "";
      }
      return currencyDetails.symbol;
    } else {
      if (position === "start") {
        return currencyDetails.symbol;
      }
      return "";
    }
  }

  function getBeforePrice() {
    const price = getFlatPrice();
    if (!price) {
      return "?";
    }
    return NumberUtils.numberFormat(Number(price.price || 0));
  }

  const errorModal = useRef<RefErrorModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);
  async function onClick() {
    if (isLoading) return;
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.set("action", "subscribe");
    formData.set("product-id", product?.id?.toString() ?? "");
    formData.set("billing-period", billingPeriod.toString());
    formData.set("currency", currency);
    formData.set("quantity", quantity.toString());
    if (referral) {
      formData.set("referral", referral);
    }
    const coupon = getCoupon();
    if (coupon) {
      formData.set("coupon", searchParams.get("coupon")?.toString() ?? "");
    }
    if (isUpgrade) {
      formData.set("is-upgrade", "true");
    } else if (isDowngrade) {
      formData.set("is-downgrade", "true");
    }

    try {
      const response = await fetch(pathname, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle successful response here
      // You might want to redirect or show success message
    } catch (error) {
      console.error("Subscription error:", error);
      errorModal.current?.show("Error", "Failed to process subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }

    AnalyticsHelper.addEvent({
      url: pathname,
      route: pathname,
      rootData: {
        userSession: rootData.userSession,
        appConfiguration: {
          ...rootData.appConfiguration,
          app: {
            ...rootData.appConfiguration.app,
            theme: typeof rootData.appConfiguration.app.theme === 'string' 
              ? { color: rootData.appConfiguration.app.theme, scheme: "system" as const }
              : rootData.appConfiguration.app.theme
          }
        },
      },
      action: "click-plan",
      category: "user",
      label: "pricing",
      value: t(product?.title ?? ""),
    });
  }
  function confirmed(product: SubscriptionProductDto | undefined) {
    if (!product) {
      return;
    }
    if (product?.title.includes("Core") || product?.title.includes("Enterprise") || product?.title.includes("Pro")) {
      window.location.href = "https://alexandromg.gumroad.com/l/TheRock";
    } else {
      window.location.href = "https://alexandromg.gumroad.com/l/TheRockDevelopment";
    }
  }
  function isDisabled() {
    if (!canSubmit || isLoading) {
      return true;
    }
    if (model === PricingModel.ONCE) {
      if (alreadyOwned && !product?.canBuyAgain) {
        return true;
      }
      return !product?.stripeId;
    }
    return !product?.stripeId;
  }

  const getCoupon = () => {
    if (!stripeCoupon) {
      return null;
    }
    if (stripeCoupon.applies_to) {
      if (stripeCoupon.applies_to.products.includes(product?.stripeId ?? "")) {
        // eslint-disable-next-line no-console
        console.log("Coupon applies to product: ", {
          product: t(product?.title ?? ""),
          discount: stripeCoupon.amount_off ? `${stripeCoupon.amount_off} ${stripeCoupon.currency}` : `${stripeCoupon.percent_off}%`,
          currency: stripeCoupon.currency,
          currentCurrency: currency,
        });
        if (!stripeCoupon.currency || stripeCoupon.currency === currency) {
          return stripeCoupon;
        }
      }
    } else {
      if (!stripeCoupon.currency || stripeCoupon.currency === currency) {
        return stripeCoupon;
      }
    }
    return null;
  };

  function applyDiscount(total: number) {
    const coupon = getCoupon();
    if (!coupon) {
      return total;
    }
    if (coupon.amount_off) {
      return total - coupon.amount_off / 100;
    } else if (coupon.percent_off) {
      return total - (total * coupon.percent_off) / 100;
    }
    return total;
  }

  function noPricesForThisCurrency() {
    const flat = prices.filter((f) => f.currency === currency);
    const usageBased = usageBasedPrices?.filter((f) => f.currency === currency) ?? [];
    return flat.length === 0 && usageBased.length === 0;
  }

  function hasQuantity() {
    return model === PricingModel.PER_SEAT || product?.hasQuantity;
  }

  return (
    <>
      {noPricesForThisCurrency() ? (
        <Fragment>
          {isPreview ? (
            <WarningBanner title="Warning">
              No price available for currency {currency} in {SubscriptionBillingPeriod[billingPeriod]} billing period
            </WarningBanner>
          ) : null}
        </Fragment>
      ) : (
        <div className={className}>
          <section
            className={clsx("relative flex w-full flex-col rounded-lg p-7 shadow-xl", !badge && "border border-secondary", badge && "border-2 border-primary")}
          >
            {badge && (
              <div className="absolute top-0 -translate-y-1/2 transform rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                {t(badge)}
              </div>
            )}
            <div className="flex-1 space-y-4">
              {/* Title and Description */}
              <div className="shrink-0 space-y-2">
                <h2 className="text-xl font-medium">{t(title)}</h2>
                {description && <p className="text-sm text-muted-foreground">{t(description)}</p>}
              </div>

              {/* Price */}
              {model !== PricingModel.USAGE_BASED && (
                <div className="shrink-0 truncate">
                  <span className="pr-1 text-sm font-bold">{getCurrencySymbolAt("start")}</span>
                  {getCoupon() ? (
                    <Fragment>
                      <span className="mr-1 text-2xl font-normal tracking-tight text-muted-foreground line-through">{getBeforePrice()}</span>
                      <span className="text-4xl font-bold tracking-tight">{getFormattedPrice()}</span>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <span className="text-4xl font-bold tracking-tight">{getFormattedPrice()}</span>
                    </Fragment>
                  )}{" "}
                  <span className="pr-1 text-sm font-bold">{getCurrencySymbolAt("end")}</span>
                  <span className="truncate uppercase text-muted-foreground"> {getCurrency()}</span>
                  {model === PricingModel.PER_SEAT && <span className="text-muted-foreground">/{t("pricing.seat").toLowerCase()}</span>}
                  {(() => {
                    if (getFlatPrice()?.billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
                      return <span className="truncate text-muted-foreground">/{t("pricing.MONTHLYShort")}</span>;
                    } else if (getFlatPrice()?.billingPeriod === SubscriptionBillingPeriod.YEARLY) {
                      return <span className="truncate text-muted-foreground">/{t("pricing.YEARLYShort")}</span>;
                    } else if (getFlatPrice()?.billingPeriod === SubscriptionBillingPeriod.QUARTERLY) {
                      return <span className="truncate text-muted-foreground">/{t("pricing.QUARTERLYShort")}</span>;
                    } else if (getFlatPrice()?.billingPeriod === SubscriptionBillingPeriod.SEMI_ANNUAL) {
                      return <span className="truncate text-muted-foreground">/{t("pricing.SEMIANNUALShort")}</span>;
                    }
                    // else if (getFlatPrice()?.billingPeriod === SubscriptionBillingPeriod.ONCE) {
                    //   return <span className="text-muted-foreground text-xs"> ({t("pricing.once")})</span>;
                    // }
                  })()}
                  {/* <div className="text-muted-foreground mt-2 text-xs italic">Cancel anytime</div> */}
                </div>
              )}

              {usageBasedPrices
                ?.sort((a, b) => (a.unit > b.unit ? 1 : -1))
                .filter((f) => f.currency === currency)
                .map((usageBasedPrice, idx) => {
                  return (
                    <div key={idx} className="flex shrink-0 flex-col">
                      <div className="text-sm font-medium">
                        <span className="">+</span> {usageBasedPrice.unitTitlePlural}
                      </div>
                      <div className="mt-3">
                        <div className="-mx-4 overflow-auto ring-1 ring-muted sm:-mx-6 md:mx-0 md:rounded-lg">
                          <table className="min-w-full divide-y divide-muted">
                            <thead>
                              <tr>
                                {usageBasedPrice.tiersMode === "graduated" ? (
                                  <>
                                    <th scope="col" className="truncate px-3 py-2 text-left text-sm font-semibold">
                                      {usageBasedPrice.unitTitlePlural}
                                    </th>
                                    <th scope="col" className="truncate px-3 py-2 text-left text-sm font-semibold">
                                      {t("pricing.usageBased.units")}
                                      <span className="font-normal text-muted-foreground">/m</span>
                                    </th>
                                  </>
                                ) : (
                                  <th scope="col" className="truncate px-3 py-2 text-left text-sm font-semibold">
                                    {t("pricing.usageBased.units")}
                                    <span className="font-normal text-muted-foreground">/month</span>
                                  </th>
                                )}
                                <th scope="col" className="truncate px-3 py-2 text-left text-sm font-semibold">
                                  {t("pricing.usageBased.perUnit")}
                                </th>
                                <th scope="col" className="truncate px-3 py-2 text-left text-sm font-semibold">
                                  {t("pricing.usageBased.flatFee")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {usageBasedPrice.tiers.map((tier, idx) => {
                                return (
                                  <tr key={tier.from}>
                                    {usageBasedPrice.tiersMode === "graduated" && (
                                      <td className="relative px-3 py-2 text-sm">
                                        <div className="truncate font-medium">
                                          <span>{idx === 0 ? t("pricing.usageBased.first") : t("pricing.usageBased.next")}</span>
                                        </div>
                                      </td>
                                    )}
                                    <td className="truncate px-3 py-2 text-sm text-muted-foreground lg:table-cell">
                                      {tier.from} - {tier.to ? tier.to : "∞"}
                                    </td>
                                    <td className="truncate px-3 py-2 text-sm text-muted-foreground lg:table-cell">
                                      {tier.perUnitPrice ? (
                                        <span>
                                          <>
                                            {getCurrencySymbol()}
                                            {tier.perUnitPrice.toString() ?? "-"}
                                            {/* <span className="text-xs uppercase">{getCurrency()}</span> */}
                                          </>
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td className="truncate px-3 py-2 text-sm text-muted-foreground lg:table-cell">
                                      {tier.flatFeePrice ? (
                                        <span>
                                          <>
                                            {getCurrencySymbol() ?? ""}
                                            {tier.flatFeePrice.toString() ?? "-"}
                                          </>
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* <div className="w-full border-t"></div> */}
              {/* Features */}
              <ul className="flex-1 space-y-1.5">
                {features
                  .sort((a, b) => (a.order > b.order ? 1 : -1))
                  .map((feature, idxFeature) => {
                    return (
                      <li key={idxFeature}>
                        <PlanFeatureDescription feature={feature} onClickFeature={onClickFeature} />
                      </li>
                    );
                  })}
              </ul>

              {/* {canSubmit && ( */}
              <div className="mt-4 space-y-2">
                {(!alreadyOwned || model === PricingModel.ONCE) &&
                getFlatPrice()?.price !== 0 &&
                hasQuantity() &&
                (model === PricingModel.PER_SEAT || model === PricingModel.ONCE) ? (
                  <div className="grid grid-cols-2 gap-2">
                    <InputNumber min={1} max={99} value={quantity} onChange={(e) => setQuantity(Number(e))} disabled={isDisabled()} />
                    <SubscribeOrBuyButton
                      product={product}
                      isPreview={product?.stripeId === undefined}
                      model={model}
                      price={getFlatPrice()}
                      badge={badge}
                      disabled={isDisabled()}
                      loading={isLoading}
                      onClick={onClick}
                      alreadyOwned={alreadyOwned}
                      isUpgrade={isUpgrade}
                      isDowngrade={isDowngrade}
                    />
                  </div>
                ) : (
                  <SubscribeOrBuyButton
                    product={product}
                    isPreview={product?.stripeId === undefined}
                    model={model}
                    price={getFlatPrice()}
                    badge={badge}
                    disabled={isDisabled()}
                    loading={isLoading}
                    onClick={onClick}
                    alreadyOwned={alreadyOwned}
                    isUpgrade={isUpgrade}
                    isDowngrade={isDowngrade}
                  />
                )}
              </div>
            </div>
          </section>
          <ErrorModal ref={errorModal} />
          <ConfirmModal ref={confirmModal} onYes={confirmed} />
        </div>
      )}
    </>
  );
}

interface SubscribeOrBuyButtonProps {
  product?: SubscriptionProductDto;
  isPreview?: boolean;
  model: PricingModel;
  badge?: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  alreadyOwned?: boolean;
  price?: SubscriptionPriceDto;
  isUpgrade?: boolean;
  isDowngrade?: boolean;
}
function SubscribeOrBuyButton({
  product,
  isPreview,
  model,
  price,
  badge,
  disabled,
  loading,
  onClick,
  alreadyOwned,
  isUpgrade,
  isDowngrade,
}: SubscribeOrBuyButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "truncate",
        loading && "base-spinner cursor-not-allowed",
        badge && !disabled
          ? "group flex w-full items-center justify-center space-x-2 rounded-md border border-primary-foreground bg-primary px-8 py-2 text-sm font-medium text-primary-foreground"
          : "group flex w-full items-center justify-center space-x-2 rounded-md border border-foreground bg-background px-8 py-2 text-sm font-medium text-foreground",
        badge && !disabled && "hover:bg-primary/90",
        !badge && !disabled && "hover:border-foreground hover:bg-secondary",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      {alreadyOwned ? (
        <>{model === PricingModel.ONCE ? t("pricing.buyAgain") : t("pricing.alreadyOwned")}</>
      ) : isPreview ? (
        <>{t("pricing.notCreated")}</>
      ) : isUpgrade ? (
        <div className="flex items-center space-x-1">
          <div>{t("shared.upgrade")}</div>
          <div>✨</div>
        </div>
      ) : isDowngrade ? (
        <>{t("shared.downgrade")}</>
      ) : (
        <span>
          <>
            {price && price.price === 0 ? (
              <span>{t("pricing.getItForFree")}</span>
            ) : (
              <span>{model === PricingModel.ONCE ? t("pricing.buy") : t("pricing.subscribe")}</span>
            )}
          </>
        </span>
      )}
    </button>
  );
}
