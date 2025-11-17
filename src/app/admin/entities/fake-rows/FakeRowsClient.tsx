"use client";

import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import TableSimple from "@/components/ui/tables/TableSimple";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import NumberUtils from "@/lib/shared/NumberUtils";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import MenuWithPopper from "@/components/ui/dropdowns/MenuWithPopper";
import InputCombobox from "@/components/ui/input/InputCombobox";
import { handleAction, loadData } from "./actions";

type TenantDataDto = {
  id: string;
  entity: EntityWithDetailsDto;
  tenant: TenantWithDetailsDto;
  activeRows: number;
  shadowRows: number;
};
type LoaderData = {
  allEntities: EntityWithDetailsDto[];
  allTenants: TenantWithDetailsDto[];
  items: TenantDataDto[];
  isDevelopment: boolean;
};

export default function FakeRowsPage({ initialData }: { initialData: LoaderData }) {
  const { t } = useTranslation();
  const [data, setData] = useState<LoaderData>(initialData);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await handleAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
        // Refresh data
        const newData = await loadData();
        setData(newData);
      }
    });
  }

  function getTenantIds() {
    const ids = newSearchParams.get("tenantIds")?.split(",") ?? [];
    return ids.filter((f) => f);
  }

  function getEntityIds() {
    const ids = newSearchParams.get("entityIds")?.split(",") ?? [];
    return ids.filter((f) => f);
  }

  function filteredItems() {
    const tenantIds = getTenantIds();
    const entityIds = getEntityIds();
    return data.items.filter((f) => {
      if (!tenantIds.includes(f.tenant.id)) {
        return false;
      }
      if (!entityIds.includes(f.entity.id)) {
        return false;
      }
      return true;
    });
  }

  function onCreateRows(item: TenantDataDto, numberOfRows: number, type?: "apiKeyLog") {
    const form = new FormData();
    form.set("action", "create-rows");
    form.set("entityId", item.entity.id);
    form.set("tenantId", item.tenant.id);
    form.set("numberOfRows", String(numberOfRows));
    if (type) {
      form.set("type", type);
    }
    handleSubmit(form);
  }
  function onUpdateRows(item: TenantDataDto, numberOfRows: number) {
    const form = new FormData();
    form.set("action", "update-rows");
    form.set("entityId", item.entity.id);
    form.set("tenantId", item.tenant.id);
    form.set("numberOfRows", String(numberOfRows));
    handleSubmit(form);
  }
  function onDeleteRows(item: TenantDataDto, { shadow, numberOfRows }: { shadow: boolean; numberOfRows: number }) {
    const form = new FormData();
    if (shadow) {
      form.set("action", "shadow-delete-rows");
    } else {
      form.set("action", "delete-rows");
    }
    form.set("entityId", item.entity.id);
    form.set("tenantId", item.tenant.id);
    form.set("numberOfRows", String(numberOfRows));

    handleSubmit(form);
  }
  return (
    <EditPageLayout title="Testing">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <InputCombobox
            title="Tenants"
            value={getTenantIds()}
            selectPlaceholder="Select tenants"
            options={data.allTenants.map((f) => {
              return {
                value: f.id,
                name: f.name,
              };
            })}
            onChange={(value) => {
              if (value) {
                newSearchParams.set("tenantIds", value.join(","));
              } else {
                newSearchParams.delete("tenantIds");
              }
              router.push(`?${newSearchParams.toString()}`);
            }}
          />

          <InputCombobox
            title="Entities"
            value={getEntityIds()}
            selectPlaceholder="Select entities"
            options={data.allEntities.map((f) => {
              return {
                value: f.id,
                name: f.name,
              };
            })}
            onChange={(value) => {
              if (value) {
                newSearchParams.set("entityIds", value.join(","));
              } else {
                newSearchParams.delete("entityIds");
              }
              router.push(`?${newSearchParams.toString()}`);
            }}
          />
        </div>
        {filteredItems().length === 0 ? (
          <div>Select at least one tenant and one entity</div>
        ) : (
          <TableSimple
            items={filteredItems()}
            headers={[
              {
                name: "entity",
                title: "Entity",
                value: (i) => t(i.entity.title),
              },
              {
                name: "tenant",
                title: "Tenant",
                className: "w-full",
                value: (i) => i.tenant.name,
              },
              {
                name: "activeRows",
                title: "Active Rows",
                value: (i) => NumberUtils.intFormat(i.activeRows),
              },
              {
                name: "shadowRows",
                title: "Shadow Rows",
                value: (i) => NumberUtils.intFormat(i.shadowRows),
              },
              {
                name: "totalRows",
                title: "Total Rows",
                value: (i) => NumberUtils.intFormat(i.activeRows + i.shadowRows),
              },
              {
                name: "actions",
                title: "",
                value: (i) => (
                  <div className="flex items-center space-x-2">
                    <MenuWithPopper
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hover:bg-secondary border-border bg-background rounded-md border px-2 py-1.5 font-medium"
                      options={[
                        ...[1, 10, 100, 1_000, 10_000, 100_000].map((numberOfRows) => {
                          return {
                            title: `${numberOfRows === 1 ? "1 row" : `${NumberUtils.intFormat(numberOfRows)} rows`}`,
                            onClick: () => onCreateRows(i, numberOfRows),
                          };
                        }),
                      ]}
                      button={<>Create</>}
                    />
                    <MenuWithPopper
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hover:bg-secondary border-border bg-background rounded-md border px-2 py-1.5 font-medium"
                      options={[
                        ...[1, 10, 100, 1_000, 10_000, 100_000].map((numberOfRows) => {
                          return {
                            title: `${numberOfRows === 1 ? "1 row" : `${NumberUtils.intFormat(numberOfRows)} rows`}`,
                            onClick: () => onUpdateRows(i, numberOfRows),
                          };
                        }),
                      ]}
                      button={<>Update</>}
                    />
                    <MenuWithPopper
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hover:bg-secondary border-border bg-background rounded-md border px-2 py-1.5 font-medium"
                      options={[
                        ...[1, 10, 100, 1_000, 10_000, 100_000].map((numberOfRows) => {
                          return {
                            title: `${numberOfRows === 1 ? "1 row" : `${NumberUtils.intFormat(numberOfRows)} rows`}`,
                            onClick: () => onDeleteRows(i, { shadow: true, numberOfRows }),
                            className: "text-orange-600",
                          };
                        }),
                      ]}
                      button={<>Shadow Delete</>}
                    />
                    <MenuWithPopper
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hover:bg-secondary border-border bg-background rounded-md border px-2 py-1.5 font-medium"
                      options={[
                        ...[1, 10, 100, 1_000, 10_000, 100_000].map((numberOfRows) => {
                          return {
                            title: `${numberOfRows === 1 ? "1 row" : `${NumberUtils.intFormat(numberOfRows)} rows`}`,
                            onClick: () => onDeleteRows(i, { shadow: false, numberOfRows }),
                            className: "text-red-600",
                          };
                        }),
                      ]}
                      button={<>Delete</>}
                    />
                    <MenuWithPopper
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="hover:bg-secondary border-border bg-background rounded-md border px-2 py-1.5 font-medium"
                      options={[
                        ...[1, 10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000].map((numberOfRows) => {
                          return {
                            title: `${numberOfRows === 1 ? "1 API log" : `${NumberUtils.intFormat(numberOfRows)} API logs`}`,
                            onClick: () => onCreateRows(i, numberOfRows, "apiKeyLog"),
                          };
                        }),
                      ]}
                      button={<>Create API Logs</>}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </EditPageLayout>
  );
}
