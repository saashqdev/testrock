"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import TenantPropertiesList from "@/components/entities/properties/TenantPropertiesList";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { useAppData } from "@/lib/state/useAppData";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";

type LoaderData = {
  entity: EntityWithDetailsDto;
  properties: PropertyWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
};

interface EntityPropertiesClientProps {
  data: LoaderData;
}

export default function EntityPropertiesClient({ data }: EntityPropertiesClientProps) {
  const { t } = useTranslation();
  const appData = useAppData();
  const router = useRouter();
  const params = useParams();

  return (
    <EditPageLayout
      title={`${t(data.entity.title)} - ${t("models.property.plural")}`}
      withHome={false}
      menu={[
        {
          title: t("models.entity.plural"),
          routePath: UrlUtils.getModulePath(params, `entities`),
        },
        {
          title: data.entity.titlePlural,
          routePath: UrlUtils.getModulePath(params, `entities/${data.entity.slug}`),
        },
      ]}
    >
      <TenantPropertiesList tenantId={appData.currentTenant.id} items={data.properties} />
      <SlideOverWideEmpty
        title={params.id ? t("shared.edit") : t("shared.new")}
        open={!!params.id}
        onClose={() => {
          router.replace(".");
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4"></div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
