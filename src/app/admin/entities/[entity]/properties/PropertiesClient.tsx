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
import { Routes } from "@/utils/api/server/EntitiesApi";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowHelper from "@/lib/helpers/RowHelper";

type PropertiesClientProps = {
  entity: EntityWithDetailsDto;
  properties: PropertyWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
  routes: Routes;
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
      const item = {
        id: `fake-item-${idx}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: idx + 1,
        entityId: initialEntity.id,
        tenantId: null,
        deletedAt: null,
        folio: idx + 1,
        createdByUserId: null,
        createdByApiKeyId: null,
        values: initialEntity.properties.map((property) => {
          return RowHelper.getFakePropertyValue({ property, t, idx: idx + 1 });
        }),
        createdByUser: {
          id: "fake-user",
          email: "john.doe@email.com",
          firstName: "John",
          lastName: "Doe",
        },
        createdByApiKey: null,
        tenant: null,
        parentRows: [],
        childRows: [],
        tags: [],
        permissions: [],
        sampleCustomEntity: null,
      } as unknown as RowWithDetailsDto;
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
        <div className="space-y-2 rounded-lg border-2 border-dashed border-border px-3 pb-3 pt-3">
          {entity.properties.filter((f) => !f.isDefault).length === 0 ? (
            <InfoBanner title="No properties" text="Add some properties to see previews" />
          ) : (
            <div className="space-y-6">
              {fakeItem && (
                <Fragment key="preview-sections">
                  <div key="row-title" className="space-y-2">
                    <Section title="Row Title" />
                    <div className="rounded-md border border-border bg-background p-3 font-medium text-foreground">
                      <RowTitle entity={entity} item={fakeItem} />
                    </div>
                  </div>

                  <div key="form" className="space-y-2">
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
                      <RowsList view={layout.value} entity={entity} items={fakeItems} routes={routes} readOnly={true} />
                    </div>
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-secondary px-3 text-base font-semibold leading-6 text-foreground">{title}</span>
      </div>
    </div>
  );
}
