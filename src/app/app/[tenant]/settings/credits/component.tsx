"use client";

import { useTranslation } from "react-i18next";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import CreditsList from "@/modules/usage/components/CreditsList";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { CreditsWithDetailsDto } from "@/db/models/subscriptions/CreditsModel";

type LoaderData = {
  items: CreditsWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  canDelete: boolean;
};

export default function Component({ data }: { data: LoaderData }) {
  const { t } = useTranslation();

  return (
    <EditPageLayout title={t("models.credit.plural")}>
      <CreditsList data={data} />
    </EditPageLayout>
  );
}
