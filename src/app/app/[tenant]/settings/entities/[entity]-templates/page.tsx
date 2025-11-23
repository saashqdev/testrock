import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityTemplate } from "@prisma/client";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

type LoaderData = {
  entity: EntityWithDetailsDto;
  items: EntityTemplate[];
};

async function getEntityTemplatesData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  // Extract entity name from params.entity which should be like "contact-templates"
  const entitySlug = params.entity?.replace("-templates", "") ?? "";
  const entity = await db.entities.getEntityBySlug({ tenantId, slug: entitySlug });
  const items = await db.entityTemplates.getEntityTemplates(entity.id, { tenantId });
  return {
    entity,
    items,
  };
}

export default async function EntityTemplatesIndex(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await getEntityTemplatesData(props);
  const params = (await props.params) || {};

  function getConfig(item: EntityTemplate) {
    try {
      const config = JSON.parse(item.config);
      const values: string[] = [];
      data.entity.properties
        .filter((f) => !f.isDefault)
        .sort((a, b) => a.order - b.order)
        .forEach((property) => {
          let value = config[property.name];
          if (value) {
            if (property.type === PropertyType.SELECT) {
              const option = property.options.find((f) => f.value === value);
              if (option) {
                value = option.name || option.value;
              }
            }
            values.push(t(property.title) + ": " + value);
          }
        });
      return values.join(", ");
    } catch (e) {
      return "";
    }
  }
  return (
    <EditPageLayout
      title={t(data.entity.titlePlural) + " - " + t("models.entity.templates")}
      withHome={false}
      menu={[
        {
          title: t("models.entity.plural"),
          routePath: UrlUtils.getModulePath(params, `entities`),
        },
        {
          title: data.entity.titlePlural,
          routePath: UrlUtils.getModulePath(params, `entities/${data.entity.slug}-templates`),
        },
      ]}
    >
      <div className="space-y-3">
        <TableSimple
          headers={[
            {
              name: "title",
              title: "Title",
              value: (item) => item.title,
            },
            {
              title: "Template",
              name: "template",
              className: "max-w-xs",
              value: (item) => <ShowPayloadModalButton title={`Template: ${item.title}`} payload={getConfig(item)} />,
            },
          ]}
          items={data.items}
          actions={[
            {
              title: t("shared.edit"),
              onClickRoute: (idx, item) => item.id,
            },
          ]}
        ></TableSimple>
        <div className="w-fu flex justify-start">
          <ButtonTertiary to="new">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium uppercase">{t("shared.add")}</span>
          </ButtonTertiary>
        </div>
      </div>
    </EditPageLayout>
  );
}
