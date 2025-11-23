"use client";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import toast from "react-hot-toast";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import PricingPlanForm from "@/components/core/pricing/PricingPlanForm";
import UrlUtils from "@/utils/app/UrlUtils";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { Portal } from "@prisma/client";
import { useActionState } from "react";

type PricingEditClientProps = {
  data: {
    title: string;
    portal: Portal;
    item: SubscriptionProductDto;
    plans: SubscriptionProductDto[];
  };
  params: any;
  submitAction: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: string }>;
};

export default function PricingEditClient({ data, params, submitAction }: PricingEditClientProps) {
  const { t } = useTranslation();
  const [state, formAction] = useActionState(submitAction, { error: undefined, success: undefined });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.success);
    }
  }, [state]);

  return (
    <EditPageLayout
      title={t("admin.pricing.title")}
      withHome={false}
      menu={[
        {
          title: data.portal.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}`),
        },
        {
          title: "Pricing",
          routePath: UrlUtils.getModulePath(params, `portals/${data.portal.subdomain}/pricing`),
        },
        {
          title: t("shared.edit"),
        },
      ]}
    >
      <form action={formAction}>
        <PricingPlanForm item={data.item} plans={data.plans} canUpdate={true} canDelete={true} isPortalPlan={true} />
      </form>
    </EditPageLayout>
  );
}
