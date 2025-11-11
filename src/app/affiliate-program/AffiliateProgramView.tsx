"use client";

import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import { useTranslation } from "react-i18next";
import { Fragment, useState } from "react";
import NumberUtils from "@/lib/shared/NumberUtils";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

type AffiliateProgramViewProps = {
  data: {
    enabled?: boolean;
    contactEmail?: string;
    affiliates: {
      percentage: number;
      plans: { title: string; price: number }[];
      signUpLink: string;
    };
  };
};

export default function AffiliateProgramView({ data }: AffiliateProgramViewProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div>
        <HeaderBlock />
        <div className="bg-background">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-2 py-12 sm:py-6">
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("affiliates.program")}</h1>
                  <h2 className="text-muted-foreground mt-4 text-lg leading-6">{t("affiliates.description")}</h2>
                </div>
                <div className="mx-auto max-w-3xl space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{t("affiliates.how.title")}</h3>
                    <p className="text-muted-foreground mt-2">{t("affiliates.how.description", { 0: data.affiliates.percentage })}</p>
                  </div>

                  <div>
                    <AffiliatesCalculator percentage={data.affiliates.percentage} plans={data.affiliates.plans} />
                  </div>

                  {data.affiliates.signUpLink && (
                    <div className="mt-4">
                      <ButtonPrimary
                        event={{ action: "click", category: "affiliate", label: "sign-up", value: data.affiliates.signUpLink }}
                        to={data.affiliates.signUpLink}
                        target="_blank"
                      >
                        {t("affiliates.signUp")}
                      </ButtonPrimary>
                    </div>
                  )}

                  {data.contactEmail && (
                    <Fragment>
                      <h3 className="text-xl font-bold">{t("front.contact.title")}</h3>
                      <p className="text-muted-foreground mt-1">
                        If you have any questions, contact us at{" "}
                        <a href={`mailto:${data.contactEmail}`} className="text-primary">
                          {data.contactEmail}
                        </a>
                        .
                      </p>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterBlock />
      </div>
    </div>
  );
}

function AffiliatesCalculator({
  percentage,
  plans,
}: {
  percentage: number;
  plans: {
    title: string;
    price: number;
  }[];
}) {
  const [customers, setCustomers] = useState(10);
  const [plan, setPlan] = useState(plans.length > 1 ? plans[1] : plans[0]);

  function getTotal() {
    if (!plan) {
      return 0;
    }
    return customers * plan.price * (percentage / 100);
  }
  if (!plan) {
    return null;
  }
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">
        You could make <span className="text-xl font-bold">${NumberUtils.intFormat(getTotal())}</span> usd for every{" "}
        <span className="text-xl font-bold">{customers} customers</span> in the{" "}
        <span className="text-xl font-bold">
          <select
            className=" w-36 rounded-lg bg-transparent text-xl font-bold focus:outline-hidden"
            value={plan.title}
            onChange={(e) => setPlan(plans.find((p) => p.title === e.target.value)!)}
          >
            {plans.map((plan) => (
              <option key={plan.title} value={plan.title}>
                {plan.title}
              </option>
            ))}
          </select>
        </span>{" "}
        plan.
      </div>
      <div className="w-full">
        <input
          type="range"
          min="1"
          max="50"
          value={customers}
          onChange={(e) => setCustomers(parseInt(e.target.value))}
          className="bg-secondary text-secondary-foreground h-4 w-full appearance-none overflow-hidden rounded-lg focus:outline-hidden"
        />
      </div>
    </div>
  );
}
