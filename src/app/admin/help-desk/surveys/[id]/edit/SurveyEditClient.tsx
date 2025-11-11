"use client";

import { useTranslation } from "react-i18next";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import SurveyForm from "@/modules/surveys/components/SurveyForm";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";
import { actionEditSurvey } from "./page";

type LoaderData = {
  item: SurveyWithDetailsDto;
};

export default function SurveyEditClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionEditSurvey, null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <NewPageLayout
      title={"Edit Survey"}
      buttons={<></>}
      menu={[
        {
          title: "Surveys",
          routePath: "/admin/help-desk/surveys",
        },
        {
          title: data.item.title,
          routePath: "",
        },
        {
          title: t("shared.edit"),
          routePath: "",
        },
      ]}
    >
      <SurveyForm item={data.item} action={action} pending={pending} />
    </NewPageLayout>
  );
}
