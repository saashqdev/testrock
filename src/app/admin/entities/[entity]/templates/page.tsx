import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityTemplate } from "@prisma/client";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

export default async function EntityTemplatesRoute(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const items = await db.entityTemplates.getEntityTemplates(entity.id, { tenantId });

  function getConfig(item: EntityTemplate) {
    try {
      const config = JSON.parse(item.config);
      const values: string[] = [];
      entity.properties
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
    <div className="space-y-3">
      <h3 className="text-foreground text-sm font-medium leading-3">Templates</h3>
      <TableSimple
        headers={[
          {
            title: "Title",
            name: "title",
            value: (item) => item.title,
          },
          {
            title: "Config",
            name: "config",
            value: (item) => <ShowPayloadModalButton title="Config" description="Config" payload={item.config} />,
          },
        ]}
        items={items}
      />
      <div className="flex justify-start">
        <ButtonTertiary to="new">
          <span className="font-medium uppercase">{t("shared.add")}</span>
        </ButtonTertiary>
      </div>
    </div>
  );
}
