"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import SurveyForm from "@/modules/surveys/components/SurveyForm";
import { useTranslation } from "react-i18next";

type ActionData = {
  success?: string;
  error?: string;
} | null;

export default function NewSurveyClient({ action }: { action: any }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [actionData, formAction, pending] = useActionState<ActionData, FormData>(action, null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
      router.push("/admin/help-desk/surveys");
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, router]);

  return (
    <NewPageLayout
      title={"New Survey"}
      buttons={<></>}
      menu={[
        {
          title: "Surveys",
          routePath: "/admin/help-desk/surveys",
        },
        {
          title: "New",
          routePath: "",
        },
      ]}
    >
      <SurveyForm item={null} action={formAction} pending={pending} />
    </NewPageLayout>
  );
}
