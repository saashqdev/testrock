"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import InputText from "@/components/ui/input/InputText";
import Modal from "@/components/ui/modals/Modal";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import OnboardingsList from "../../../components/OnboardingsList";
import { LoaderData } from "../../api/onboardings/OnboardingsIndexApi.server";
import { createOnboarding } from "@/app/admin/onboarding/onboardings/actions";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";

export default function OnboardingsIndexRoute({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const [adding, setAdding] = useState(false);
  const [actionData, setActionData] = useState<{ error?: string; success?: string }>();

  function countStatus(status?: string) {
    if (!status) {
      let total = 0;
      data?.groupByStatus.forEach((item) => {
        total += item.count;
      });
      return total;
    }
    const item = data?.groupByStatus.find((item) => item.status === status);
    return item ? item.count : 0;
  }
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="flex items-center justify-between space-x-2">
        <div className="grow">
          <TabsWithIcons
            tabs={[
              {
                name: `${t("shared.all")} ${countStatus() ? `(${countStatus()})` : ""}`,
                href: "?",
                current: !searchParams.get("status") || searchParams.get("status") === "all",
              },
              {
                name: `${t("shared.active")} ${countStatus("active") ? `(${countStatus("active")})` : ""}`,
                href: "?status=active",
                current: searchParams.get("status") === "active",
              },
              {
                name: `${t("shared.inactive")} ${countStatus("inactive") ? `(${countStatus("inactive")})` : ""}`,
                href: "?status=inactive",
                current: searchParams.get("status") === "inactive",
              },
            ]}
          />
        </div>
        <div>
          <ButtonPrimary onClick={() => setAdding(true)}>
            <div>{t("shared.new")}</div>
            <PlusIcon className="h-5 w-5" />
          </ButtonPrimary>
        </div>
      </div>

      <OnboardingsList items={data.items} groupByStatus={data.groupByStatus} />

      <AddOnboardingModal open={adding} onClose={() => setAdding(false)} setActionData={setActionData} />
      <ActionResultModal actionData={actionData} />
    </div>
  );
}

function AddOnboardingModal({
  open,
  onClose,
  setActionData,
}: {
  open: boolean;
  onClose: () => void;
  setActionData: (data: { error?: string; success?: string }) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await createOnboarding(formData);
    if (result?.error) {
      setActionData({ error: result.error });
    }
    // If successful, the redirect will happen automatically
  }

  return (
    <Modal open={open} setOpen={onClose} size="md">
      <form action={handleSubmit} className="inline-block w-full overflow-hidden bg-background p-1 text-left align-bottom sm:align-middle">
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-medium leading-6 text-foreground">Create onboarding</h3>
        </div>
        <div className="mt-4 space-y-2">
          <InputText name="title" title={t("onboarding.object.title")} value={title} setValue={(e) => setTitle(e)} required />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
          <ButtonSecondary type="button" onClick={onClose} className="flex w-full justify-center">
            {t("shared.back")}
          </ButtonSecondary>
          <LoadingButton type="submit" className="flex w-full justify-center">
            {t("shared.create")}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
