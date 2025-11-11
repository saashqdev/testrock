"use client";

import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import { useActionState, useEffect, useRef, Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { actionAdminPricingEdit } from "./actions";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";
import PricingPlanForm from "@/modules/subscriptions/components/pricing/PricingPlanForm";
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import { useEscapeKeypress } from "@/lib/shared/KeypressUtils";

interface Props {
  item: SubscriptionProductDto;
}

export default function ({ item }: Props) {
  const [actionData, action, pending] = useActionState(actionAdminPricingEdit, null);
  const { t } = useTranslation();
  const router = useRouter();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [showing, setShowing] = useState(false);

  useEffect(() => {
    setShowing(true);
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  function close() {
    setShowing(false);
    setTimeout(() => {
      router.push("/admin/settings/pricing");
    }, 200);
  }

  useEscapeKeypress(close);

  return (
    <div>
      <div>
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={close}>
                <div className="bg-foreground/90 absolute inset-0 opacity-75"></div>
              </div>
            </Transition>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition
              as={Fragment}
              show={showing}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className="bg-background my-8 inline-block w-full transform overflow-visible rounded-sm px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:max-w-2xl sm:p-6 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div className="absolute right-0 top-0 -mt-4 pr-4">
                  <button
                    onClick={close}
                    type="button"
                    className="border-border hover:text-muted-foreground text-muted-foreground bg-background flex items-center justify-center rounded-full border p-1 hover:bg-gray-200 focus:outline-hidden"
                  >
                    <span className="sr-only">{t("shared.close")}</span>
                    <svg
                      className="text-foreground/80 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">{t("admin.pricing.edit")}</h4>
                  </div>

                  <PricingPlanForm item={item} serverAction={{ actionData, action, pending }} />
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <ErrorModal ref={errorModal} />
      <SuccessModal ref={successModal} onClosed={close} />
    </div>
  );
}
