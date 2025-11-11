"use client";

import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import UrlUtils from "@/utils/app/UrlUtils";
import { useEscapeKeypress } from "@/lib/shared/KeypressUtils";
import CheckPlanFeatureLimit from "../subscription/CheckPlanFeatureLimit";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import toast from "react-hot-toast";

interface Props {
  title: string;
  featurePlanUsage: PlanFeatureUsageDto | undefined;
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export default function NewMember({ featurePlanUsage, action }: Props) {
  const params = useParams();
  const pathname = usePathname();
  const [state, formAction] = useFormState(action, { fields: {} });
  const { t } = useTranslation();
  const router = useRouter();
  const { pending } = useFormStatus();

  const loading = pending;

  const inputEmail = useRef<HTMLInputElement>(null);

  const [sendEmail, setSendEmail] = useState<boolean>(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    // nextTick(() => {
    if (inputEmail.current) {
      inputEmail.current?.focus();
      inputEmail.current?.select();
    }
    // });
  }, []);

  function close() {
    if (pathname.startsWith("/app")) {
      router.replace(UrlUtils.currentTenantUrl(params, "settings/members"));
    } else {
      router.replace("/admin/members");
    }
  }

  useEscapeKeypress(close);
  return (
    <CheckPlanFeatureLimit item={featurePlanUsage}>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {/*Email */}
          <div className="col-span-2">
            <label htmlFor="email" className="block truncate text-xs font-medium text-foreground/80">
              <div className="flex space-x-1 truncate">
                <div>{t("models.user.email")}</div>
                <div className="ml-1 text-red-500">*</div>
              </div>
            </label>
            <div className="shadow-2xs mt-1 flex w-full rounded-md">
              <input
                type="email"
                ref={inputEmail}
                name="email"
                id="email"
                autoComplete="off"
                required
                defaultValue={state?.fields?.email}
                disabled={loading}
                className={clsx(
                  "focus:border-theme-500 block w-full min-w-0 flex-1 rounded-md border-border lowercase focus:ring-ring sm:text-sm",
                  loading && "cursor-not-allowed bg-secondary/90"
                )}
              />
            </div>
          </div>
          {/*Email: End */}

          {/*User First Name */}
          <div>
            <label htmlFor="first-name" className="block truncate text-xs font-medium text-foreground/80">
              <div className="flex space-x-1 truncate">
                <div>{t("models.user.firstName")}</div>
                <div className="ml-1 text-red-500">*</div>
              </div>
            </label>
            <div className="shadow-2xs mt-1 flex w-full rounded-md">
              <input
                type="text"
                id="first-name"
                name="first-name"
                autoComplete="off"
                required
                defaultValue={state?.fields?.firstName}
                className={clsx(
                  "focus:border-theme-500 block w-full min-w-0 flex-1 rounded-md border-border focus:ring-ring sm:text-sm",
                  loading && "cursor-not-allowed bg-secondary/90"
                )}
              />
            </div>
          </div>
          {/*User First Name: End */}

          {/*User Last Name */}
          <div>
            <label htmlFor="last-name" className="block truncate text-xs font-medium text-foreground/80">
              {t("models.user.lastName")}
            </label>
            <div className="shadow-2xs mt-1 flex w-full rounded-md">
              <input
                type="text"
                id="last-name"
                name="last-name"
                autoComplete="off"
                defaultValue={state?.fields?.lastName}
                className={clsx(
                  "focus:border-theme-500 block w-full min-w-0 flex-1 rounded-md border-border focus:ring-ring sm:text-sm",
                  loading && "cursor-not-allowed bg-secondary/90"
                )}
              />
            </div>
          </div>
          {/*User Last Name: End */}

          <div className="col-span-2">
            <InputCheckboxWithDescription
              name="send-invitation-email"
              title="Send email"
              description="Send an invitation email to the user"
              value={sendEmail}
              onChange={setSendEmail}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-theme-700 text-sm">{loading && <div>{t("shared.loading")}...</div>}</div>

          <div className="flex items-center space-x-2">
            <button
              disabled={loading}
              className={clsx(
                "shadow-2xs focus:outline-hidden inline-flex items-center space-x-2 border border-border bg-background px-3 py-2 font-medium text-foreground/80 hover:bg-secondary focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:rounded-md sm:text-sm",
                loading && "cursor-not-allowed bg-secondary/90"
              )}
              type="button"
              onClick={close}
            >
              <div>{t("shared.cancel")}</div>
            </button>
            <button
              disabled={loading}
              className={clsx(
                "shadow-2xs focus:outline-hidden inline-flex items-center space-x-2 border border-transparent bg-primary px-3 py-2 font-medium text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:rounded-md sm:text-sm",
                loading && "cursor-not-allowed opacity-50"
              )}
              type="submit"
            >
              <div>{t("shared.invite")}</div>
            </button>
          </div>
        </div>
      </form>
    </CheckPlanFeatureLimit>
  );
}
