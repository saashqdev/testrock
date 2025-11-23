"use client";

import { usePathname, useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import StarsIconFilled from "@/components/ui/icons/StarsIconFilled";
import InputText from "@/components/ui/input/InputText";
import Modal from "@/components/ui/modals/Modal";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";

export default function AddFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Fragment>
      <div className="relative hidden sm:inline-flex">
        <div className="relative">
          <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
            <div className="relative z-0 inline-flex rounded-full text-sm shadow-none">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="focus:outline-hidden relative inline-flex items-center rounded-full border border-border bg-secondary p-2 font-medium text-muted-foreground shadow-inner hover:bg-secondary/90 focus:z-10 focus:ring-2 focus:ring-offset-2"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="chat-label"
              >
                <span className="sr-only">Feedback</span>

                <StarsIconFilled className="h-5 w-5 p-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal open={isOpen} setOpen={setIsOpen} size="sm">
        <FeedbackForm onClose={() => setIsOpen(false)} />
      </Modal>
    </Fragment>
  );
}

function FeedbackForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/app/${params.tenant || ""}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.success);
        onClose();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} method="post">
      <input type="hidden" name="action" value="add-feedback" readOnly />
      <input type="hidden" name="tenantId" value={appOrAdminData?.currentTenant?.id || ""} readOnly />
      <input type="hidden" name="fromUrl" value={pathname} readOnly />
      <div className="space-y-3">
        <h3 className="text-lg font-medium leading-6">{t("feedback.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("feedback.description")}</p>
        <InputText name="message" defaultValue="" required rows={5} placeholder={t("feedback.placeholder")} />
        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:underline">
            {t("shared.cancel")}
          </button>
          <ButtonPrimary type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("shared.submitting") || "Submitting..." : t("feedback.send")}
          </ButtonPrimary>
        </div>
      </div>
    </form>
  );
}
