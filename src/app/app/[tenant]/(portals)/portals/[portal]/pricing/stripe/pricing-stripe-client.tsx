"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Stripe from "stripe";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import InputSelect from "@/components/ui/input/InputSelect";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import StripeConnectUtils from "@/modules/portals/utils/StripeConnectUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { connectStripeAction, reconnectStripeAction, deleteStripeAction } from "./pricing-stripe-actions";

type PricingStripeClientProps = {
  data: {
    item: PortalWithDetailsDto;
    stripeAccount: Stripe.Account | null;
  };
  params: any;
};

export default function PricingStripeClient({ data, params: serverParams }: PricingStripeClientProps) {
  const { t } = useTranslation();
  const params = useParams();
  const confirmDelete = useRef<RefConfirmModal>(null);

  async function handleConnectStripe(formData: FormData) {
    const country = formData.get("country") as string;
    if (!country) {
      toast.error("Country is required");
      return;
    }

    const result = await connectStripeAction(country, serverParams.portal);
    if (result.error) {
      toast.error(result.error);
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  async function handleReconnectStripe() {
    const result = await reconnectStripeAction(serverParams.portal);
    if (result.error) {
      toast.error(result.error);
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  function onDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  async function onDeleteConfirm() {
    const result = await deleteStripeAction(serverParams.portal);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      window.location.reload();
    }
  }

  return (
    <EditPageLayout
      title="Connect Stripe"
      withHome={false}
      menu={[
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: "Pricing",
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}/pricing`),
        },
        {
          title: "Stripe",
        },
      ]}
    >
      {!data.stripeAccount ? (
        <div className="space-y-2">
          <p className="">Start accepting payments by connecting your Stripe account.</p>
          <form action={handleConnectStripe} className="space-y-2">
            <div className="w-40">
              <InputSelect name="country" title="Country" placeholder="Select..." options={StripeConnectUtils.stripeConnectCountries} required />
            </div>
            <div>
              <LoadingButton
                className="bg-[#5433FF] text-white hover:bg-[#4F2DFF] focus:ring-[#5433FF] focus:ring-opacity-50 active:bg-[#4F2DFF]"
                type="submit"
              >
                Connect with Stripe
              </LoadingButton>
            </div>
          </form>
        </div>
      ) : !data.stripeAccount.charges_enabled ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <XIcon className="h-6 w-6 text-red-500" />
            <div className="text-lg font-medium">Your Stripe integration is pending</div>
          </div>
          <form action={handleReconnectStripe}>
            <LoadingButton
              className="bg-[#5433FF] hover:bg-[#4F2DFF] focus:ring-[#5433FF] focus:ring-opacity-50 active:bg-[#4F2DFF]"
              type="submit"
            >
              Reconnect
            </LoadingButton>
          </form>

          <div className="space-y-2">
            <form onSubmit={onDelete}>
              <ButtonSecondary destructive type="submit">
                Disconnect
              </ButtonSecondary>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-6 w-6 text-green-500" />
            <div className="text-lg font-medium">Stripe connected</div>
          </div>

          <div>
            <form onSubmit={onDelete}>
              <ButtonSecondary destructive type="submit">
                Disconnect
              </ButtonSecondary>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}
