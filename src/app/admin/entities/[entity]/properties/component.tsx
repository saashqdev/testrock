"use client";

import { useRouter, useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import PropertiesList from "@/components/entities/properties/PropertiesList";
import RowForm from "@/components/entities/rows/RowForm";
import RowTitle from "@/components/entities/rows/RowTitle";
import RowsList from "@/components/entities/rows/RowsList";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import { EntityViewLayoutTypes } from "@/modules/rows/dtos/EntityViewLayoutType";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowHelper from "@/lib/helpers/RowHelper";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";

type PropertiesClientProps = {
  entity: EntityWithDetailsDto;
  properties: PropertyWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
  routes: EntitiesApi.Routes;
};

export default function PropertiesClient({ entity: initialEntity, properties, allEntities, routes }: PropertiesClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();

  const [entity, setEntity] = useState<EntityWithDetailsDto>(initialEntity);
  const [fakeItems, setFakeItems] = useState<RowWithDetailsDto[]>([]);
  const [fakeItem, setFakeItem] = useState<RowWithDetailsDto | null>(null);

  useEffect(() => {
    setEntity(initialEntity);

    const items: RowWithDetailsDto[] = Array.from({ length: 10 }).map((_, idx) => {
      const item: RowWithDetailsDto = {
        values: initialEntity.properties.map((property) => {
          return RowHelper.getFakePropertyValue({ property, t, idx: idx + 1 });
        }),
        folio: idx + 1,
        createdAt: new Date(),
        createdByUser: {
          email: "john.doe@email.com",
          firstName: "John",
          lastName: "Doe",
        },
      } as RowWithDetailsDto;
      return item;
    });
    setFakeItems(items);
    setFakeItem(items[0]);
  }, [initialEntity, t]);

  return (
    <div className="space-y-2 2xl:grid 2xl:grid-cols-2 2xl:gap-6 2xl:space-y-0">
      <PropertiesList items={properties.filter((f) => f.tenantId === null)} />

      <div className="space-y-2">
        <h2 className="text-lg font-bold">Previews</h2>
        <div className="border-border space-y-2 rounded-lg border-2 border-dashed px-3 pt-3 pb-3">
          {entity.properties.filter((f) => !f.isDefault).length === 0 ? (
            <InfoBanner title="No properties" text="Add some properties to see previews" />
          ) : (
            <div className="space-y-6">
              {fakeItem && (
                <Fragment>
                  <div className="space-y-2">
                    <Section title="Row Title" />
                    <div className="border-border text-foreground bg-background rounded-md border p-3 font-medium">
                      <RowTitle entity={entity} item={fakeItem} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Section title="Form" />
                    <RowForm entity={entity} item={fakeItem} canSubmit={false} allEntities={allEntities} routes={routes} />
                  </div>
                </Fragment>
              )}

              {EntityViewLayoutTypes.map((layout) => {
                if (layout.value === "board" && !entity.properties.find((f) => f.type === PropertyType.SELECT)) {
                  return null;
                }
                return (
                  <Fragment key={layout.value}>
                    <div className="space-y-2">
                      <Section title={`List - ${layout.name} layout`} />
                      <RowsList view={layout.value} entity={entity} items={fakeItems} routes={routes} />
                    </div>
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SlideOverWideEmpty
        title={params.id ? t("shared.edit") : t("shared.new")}
        open={!!<></>}
        onClose={() => {
          router.replace(".");
        }}
        className="sm:max-w-lg"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{<></>}</div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="border-border w-full border-t"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="text-foreground bg-secondary px-3 text-base leading-6 font-semibold">{title}</span>
      </div>
    </div>
  );
}
