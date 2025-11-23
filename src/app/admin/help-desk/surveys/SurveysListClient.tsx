"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import DateCell from "@/components/ui/dates/DateCell";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import XIcon from "@/components/ui/icons/XIcon";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";
import NumberUtils from "@/lib/shared/NumberUtils";

interface Props {
  items: SurveyWithDetailsDto[];
}

export default function SurveysListClient({ items }: Props) {
  const { t } = useTranslation();

  return (
    <EditPageLayout
      title="Surveys"
      buttons={
        <>
          <ButtonSecondary target="_blank" to="/surveys">
            {t("shared.viewAll")}
          </ButtonSecondary>
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={items}
        actions={[
          {
            title: (
              <div className="flex items-center space-x-2">
                <div>Public URL</div>
                <ExternalLinkEmptyIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            ),
            onClickRoute: (_, item) => `/surveys/${item.slug}`,
          },
          {
            title: "Overview",
            onClickRoute: (_, item) => item.id,
          },
          {
            title: "Submissions",
            onClickRoute: (_, item) => `${item.id}/submissions`,
          },
          {
            title: "Edit",
            onClickRoute: (_, item) => `${item.id}/edit`,
          },
        ]}
        headers={[
          {
            name: "survey",
            title: "Survey",
            className: "w-full",
            value: (item) => (
              <div>
                <Link href={`${item.id}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
              </div>
            ),
          },
          {
            name: "isPublic",
            title: "Public",
            value: (item) => (item.isPublic ? <CheckIcon className="h-5 w-5 text-teal-500" /> : <XIcon className="h-5 w-5 text-muted-foreground" />),
          },
          {
            name: "isEnabled",
            title: "Enabled",
            value: (item) => (item.isEnabled ? <CheckIcon className="h-5 w-5 text-teal-500" /> : <XIcon className="h-5 w-5 text-muted-foreground" />),
          },
          {
            name: "submissions",
            title: "Submissions",
            value: (item) => <Link href={`/admin/help-desk/surveys/${item.id}/submissions`}>{NumberUtils.intFormat(item._count.submissions)}</Link>,
          },
          {
            name: "createdAt",
            title: "Created At",
            value: (item) => <DateCell date={item.createdAt} />,
          },
        ]}
      />
    </EditPageLayout>
  );
}
