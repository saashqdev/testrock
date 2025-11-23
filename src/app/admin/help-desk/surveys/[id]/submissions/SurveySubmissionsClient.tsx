"use client";

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple, { RowHeaderDisplayDto } from "@/components/ui/tables/TableSimple";
import { SurveySubmissionWithDetailsDto } from "@/db/models/helpDesk/SurveySubmissionsModel";
import { SurveyDto } from "@/modules/surveys/dtos/SurveyDtos";
import DateUtils from "@/lib/shared/DateUtils";
import { deleteSurveySubmission } from "./page";

type PageData = {
  item: SurveyDto;
  submissions: SurveySubmissionWithDetailsDto[];
};

export default function SurveySubmissionsClient({ data, surveyId }: { data: PageData; surveyId: string }) {
  const { t } = useTranslation();
  const [actionData, action] = useActionState(deleteSurveySubmission, null);
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<SurveySubmissionWithDetailsDto>[]>([]);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  useEffect(() => {
    if (!data) return;

    const headers: RowHeaderDisplayDto<SurveySubmissionWithDetailsDto>[] = [
      {
        name: "results",
        title: "",
        value: (item, idx) => (
          <div>
            <ShowPayloadModalButton
              description={<div className="text-xs font-medium text-muted-foreground">#{idx + 1}</div>}
              payload={JSON.stringify(item.results, null, 2)}
            />
          </div>
        ),
      },
      {
        name: "date",
        title: "Date",
        value: (i) => (
          <time title={DateUtils.dateYMDHMS(i.createdAt)} className="text-xs text-muted-foreground">
            {DateUtils.dateAgo(i.createdAt)}
          </time>
        ),
      },
    ];

    data.item.items.forEach((item, idx) => {
      headers.push({
        name: item.title,
        title: item.title,
        value: (submission) => {
          const result = submission.results.find((r) => r.surveyItemTitle === item.title);
          if (!result) {
            return <div>-</div>;
          }
          if (result.other) {
            return (
              <div>
                {result.value?.toString()}: {result.other}
              </div>
            );
          } else if (typeof result.value === "string") {
            return <div>{result.value}</div>;
          } else if (Array.isArray(result.value)) {
            return <div>{result.value.join(", ")}</div>;
          } else {
            return <div>{JSON.stringify(result.value)}</div>;
          }
        },
      });
    });

    headers.push(
      {
        name: "ipAddress",
        title: "IP Address",
        value: (item) => item.ipAddress,
      },
      {
        name: "cookie",
        title: "Cookie",
        className: "w-full",
        value: (i) => <div className="w-20 truncate text-xs text-foreground">{i.userAnalyticsId}</div>,
      }
    );
    setHeaders(headers);
  }, [data]);

  return (
    <EditPageLayout
      withHome={false}
      title={data.item.title}
      buttons={
        <>
          <ButtonSecondary to={`/admin/help-desk/surveys/${surveyId}/edit`}>{t("shared.edit")}</ButtonSecondary>
        </>
      }
      tabs={[
        { name: "Overview", routePath: `/admin/help-desk/surveys/${surveyId}` },
        { name: "Submissions", routePath: `/admin/help-desk/surveys/${surveyId}/submissions` },
      ]}
    >
      <div className="space-y-2">
        <TableSimple
          items={data.submissions}
          actions={[
            {
              title: t("shared.delete"),
              onClick: (_, item) => {
                const formData = new FormData();
                formData.append("action", "delete");
                formData.append("id", item.id);
                formData.append("surveyId", surveyId);
                action(formData);
              },
              destructive: true,
              confirmation: (i) => ({
                title: t("shared.delete"),
                description: t("shared.warningCannotUndo"),
              }),
            },
          ]}
          headers={headers}
        />
      </div>
    </EditPageLayout>
  );
}
