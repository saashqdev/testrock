"use client";

import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import { SurveySubmissionWithDetailsDto } from "@/db/models/helpDesk/SurveySubmissionsModel";
import { SurveyDto } from "@/modules/surveys/dtos/SurveyDtos";

type SurveyDetailsClientProps = {
  data: {
    item: SurveyDto;
    submissions: SurveySubmissionWithDetailsDto[];
  };
  surveyId: string;
};

export default function SurveyDetailsClient({ data, surveyId }: SurveyDetailsClientProps) {
  const { t } = useTranslation();

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
        {data.item.items.map((surveyItem, idx) => {
          return (
            <div key={idx} className="space-y-1">
              <p className="text-base font-semibold">{surveyItem.title}</p>
              <TableSimple
                items={surveyItem.options.map((opt, index) => ({ ...opt, id: index }))}
                headers={[
                  {
                    name: "title",
                    title: "Title",
                    className: "w-full",
                    value: (item) => {
                      if (item.isOther) {
                        const results = data.submissions.flatMap((f) => f.results).filter((result) => result.surveyItemTitle === surveyItem.title);
                        return (
                          <ShowPayloadModalButton
                            description={item.title}
                            payload={JSON.stringify(
                              results.map((f) => f.other),
                              null,
                              2
                            )}
                          />
                        );
                      }
                      return <div>{item.title}</div>;
                    },
                  },
                  {
                    name: "votes",
                    title: "Votes",
                    value: (item) => {
                      const itemResults = data.submissions.flatMap((f) => f.results).filter((result) => result.surveyItemTitle === surveyItem.title);
                      const optionResults = itemResults.filter((result) => {
                        if (typeof result.value === "string") {
                          return result.value === item.title;
                        } else if (Array.isArray(result.value)) {
                          return result.value.includes(item.title);
                        } else {
                          return false;
                        }
                      });
                      return <div>{optionResults.length} votes</div>;
                    },
                  },
                ]}
              />
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
