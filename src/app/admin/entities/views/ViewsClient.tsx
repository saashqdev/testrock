"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import InputFilters from "@/components/ui/input/InputFilters";
import EntityViewsTable from "@/components/entities/views/EntityViewsTable";
import EntityViewForm from "@/components/entities/views/EntityViewForm";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { updateEntityView, deleteEntityView, createEntityView } from "./actions";
import { useToast } from "@/components/ui/use-toast";

type EntityViewsClientProps = {
  items: EntityViewsWithTenantAndUserDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
  entities: EntityWithDetailsDto[];
};

export default function EntityViewsClient({ items, pagination, filterableProperties, entities }: EntityViewsClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";

  // Use entities from props (server data) or fallback to context
  const availableEntities = entities.length > 0 ? entities : (appOrAdminData?.entities ?? []);
  const entitiesWithViews = availableEntities.filter((f) => f.hasViews);
  const hasNoEntities = entitiesWithViews.length === 0;

  return (
    <EditPageLayout
      title={
        <TabsWithIcons
          breakpoint="lg"
          tabs={[
            {
              name: "All",
              href: "/admin/entities/views",
              current: pathname + search === "/admin/entities/views",
            },
            {
              name: "All accounts",
              href: "/admin/entities/views?type=default",
              current: pathname + search === "/admin/entities/views?type=default",
            },
            {
              name: t("models.view.types.tenant"),
              href: "/admin/entities/views?type=tenant",
              current: pathname + search === "/admin/entities/views?type=tenant",
            },
            {
              name: t("models.view.types.user"),
              href: "/admin/entities/views?type=user",
              current: pathname + search === "/admin/entities/views?type=user",
            },
            {
              name: t("models.view.types.system"),
              href: "/admin/entities/views?type=system",
              current: pathname + search === "/admin/entities/views?type=system",
            },
          ]}
        />
      }
      buttons={
        <>
          <InputFilters filters={filterableProperties} withSearch={false} />
          <Dropdown
            right={false}
            button={<span>{t("shared.add")} view</span>}
            disabled={hasNoEntities}
            options={
              <div>
                {entitiesWithViews.map((f) => {
                  return (
                    <Menu.Item key={f.id}>
                      {({ active }) => (
                        <Link
                          href={`/admin/entities/views/new/${f.name}${search}`}
                          className={clsx("w-full truncate", active ? "text-foreground bg-secondary/90" : "text-foreground/80", "block px-4 py-2 text-sm")}
                        >
                          <div className="truncate">
                            {t(f.title)} <span className="text-muted-foreground text-xs">({f.name})</span>
                          </div>
                        </Link>
                      )}
                    </Menu.Item>
                  );
                })}
              </div>
            }
          ></Dropdown>
        </>
      }
    >
      <EntityViewsTable
        items={items}
        onClickRoute={(i) => {
          const params = new URLSearchParams(search);
          params.set("edit", i.id);
          return `/admin/entities/views?${params.toString()}`;
        }}
      />

      <SlideOverWideEmpty
        title={searchParams.get("edit") ? "Edit view" : searchParams.get("entity") ? `New ${searchParams.get("entity")} view` : "New view"}
        open={!!searchParams.get("edit") || !!searchParams.get("entity")}
        onClose={() => {
          const newParams = new URLSearchParams(search);
          newParams.delete("edit");
          newParams.delete("entity");
          router.push("/admin/entities/views" + (newParams.toString() ? `?${newParams.toString()}` : ""));
        }}
        className="sm:max-w-2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            {searchParams.get("edit") && <EntityViewSlideoverContent viewId={searchParams.get("edit")!} items={items} entities={entities} onClose={() => {
              const newParams = new URLSearchParams(search);
              newParams.delete("edit");
              router.push("/admin/entities/views" + (newParams.toString() ? `?${newParams.toString()}` : ""));
            }} />}
            {searchParams.get("entity") && <NewEntityViewSlideoverContent entityName={searchParams.get("entity")!} entities={entities} onClose={() => {
              const newParams = new URLSearchParams(search);
              newParams.delete("entity");
              router.push("/admin/entities/views" + (newParams.toString() ? `?${newParams.toString()}` : ""));
            }} />}
          </div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}

// Component for editing an existing entity view
function EntityViewSlideoverContent({ 
  viewId, 
  items,
  entities,
  onClose 
}: { 
  viewId: string; 
  items: EntityViewsWithTenantAndUserDto[];
  entities: EntityWithDetailsDto[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [entity, setEntity] = useState<EntityWithDetailsDto | undefined>();
  const [type, setType] = useState<"default" | "tenant" | "user" | "system">();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Find the item in the provided items list
  const item = items.find(i => i.id === viewId);

  useEffect(() => {
    if (item) {
      const foundEntity = entities.find((f) => f.id === item.entityId);
      setEntity(foundEntity);
      setTenantId(item.tenantId ?? null);
      setUserId(item.userId ?? null);
      if (item.isSystem) {
        setType("system");
      } else if (!item.tenantId && !item.userId) {
        setType("default");
      } else if (item.tenantId && !item.userId) {
        setType("tenant");
      } else if (item.userId) {
        setType("user");
      }
    }
  }, [item, entities]);

  async function handleSubmit(formData: FormData) {
    const action = formData.get("action")?.toString();
    formData.set("id", viewId);

    try {
      if (action === "delete") {
        const result = await deleteEntityView(formData);
        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          onClose();
        }
      } else {
        const result = await updateEntityView(formData);
        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        } else {
          onClose();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  }

  if (!item) {
    return <div className="p-4">Entity view not found</div>;
  }

  if (!entity || !type) {
    return (
      <div className="p-4">
        <div>Loading entity data...</div>
        <div className="text-xs text-muted-foreground mt-2">
          Entity ID: {item.entityId}<br />
          Available entities: {entities.length}<br />
          Check console for details
        </div>
      </div>
    );
  }

  return (
    <EntityViewForm
      entity={entity}
      tenantId={tenantId}
      userId={userId}
      isSystem={type === "system"}
      item={item}
      onClose={onClose}
      showViewType={true}
      onSubmit={handleSubmit}
    />
  );
}

// Component for creating a new entity view
function NewEntityViewSlideoverContent({ 
  entityName, 
  entities, 
  onClose 
}: { 
  entityName: string; 
  entities: EntityWithDetailsDto[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  // Determine type from URL params (default, tenant, user, system)
  const typeFromUrl = searchParams.get("type");
  let isSystem = false;
  let tenantId: string | null = null;
  let userId: string | null = null;

  if (typeFromUrl === "system") {
    isSystem = true;
  } else if (typeFromUrl === "tenant") {
    // tenantId will be set when form is submitted based on selection
  } else if (typeFromUrl === "user") {
    // userId will be set when form is submitted based on selection
  }

  const entity = entities.find((e) => e.name === entityName);

  if (!entity) {
    console.error("Entity not found:", { entityName, availableEntities: entities.map(e => e.name) });
    return <div className="p-4">Entity not found: {entityName}</div>;
  }

  const entityId = entity.id; // Store for closure

  async function handleSubmit(formData: FormData) {
    formData.set("entityId", entityId);
    
    try {
      const result = await createEntityView(formData);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <EntityViewForm
      entity={entity}
      tenantId={tenantId}
      userId={userId}
      isSystem={isSystem}
      item={null}
      onClose={onClose}
      showViewType={true}
      onSubmit={handleSubmit}
    />
  );
}
