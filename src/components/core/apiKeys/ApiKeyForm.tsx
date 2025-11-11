"use client";

import { Tenant } from "@prisma/client";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DefaultEntityTypes } from "@/lib/dtos/shared/DefaultEntityTypes";
import FormGroup from "@/components/ui/forms/FormGroup";
import InputCheckboxInline from "@/components/ui/input/InputCheckboxInline";
import InputDate from "@/components/ui/input/InputDate";
import InputSelect from "@/components/ui/input/InputSelect";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { EntityDto } from "@/db/models/entityBuilder/EntitiesModel";
import { updateItemByIdx } from "@/lib/shared/ObjectUtils";

interface Props {
  entities: EntityDto[];
  item?: ApiKeyWithDetailsDto | null;
  tenants?: Tenant[];
  canUpdate?: boolean;
  canDelete?: boolean;
  onSubmit?: (formData: FormData) => void;
  action?: (formData: FormData) => void;
  error?: string;
}
export default function ApiKeyForm({ entities, item, tenants, canUpdate = true, canDelete, onSubmit, action, error }: Props) {
  const { t } = useTranslation();

  const inputName = useRef<RefInputText>(null);

  const [tenantId, setTenantId] = useState<string | number | undefined>(item?.tenantId ?? "");
  const [alias, setAlias] = useState(item?.alias ?? "");
  const [expires, setExpires] = useState<Date | undefined>(item?.expires ?? undefined);
  const [active, setActive] = useState(item?.active ?? true);
  const [permissions, setPermissions] = useState<{ entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[]>([]);

  useEffect(() => {
    const permissions: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = [];
    entities
      .filter((f) => (f.type === DefaultEntityTypes.AppOnly || f.type === DefaultEntityTypes.All) && f.hasApi)
      .forEach((entity) => {
        const existing = item?.entities.find((f) => f.entityId === entity.id);
        permissions.push({
          entityId: entity.id,
          create: existing?.create ?? true,
          read: existing?.read ?? true,
          update: existing?.update ?? true,
          delete: existing?.delete ?? true,
        });
      });
    setPermissions(permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      inputName.current?.input.current?.focus();
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormGroup id={item?.id} editing={true} canUpdate={canUpdate} canDelete={canDelete} onSubmit={action || onSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {tenants && (
          <>
            <InputSelect
              className="col-span-6"
              name="tenant-id"
              title={t("models.tenant.object")}
              value={tenantId}
              onChange={setTenantId}
              options={
                tenants?.map((tenant) => {
                  return {
                    name: tenant.name,
                    value: tenant.id,
                  };
                }) ?? []
              }
              disabled={tenants === undefined || !canUpdate}
            ></InputSelect>
          </>
        )}
        <InputText
          disabled={!canUpdate}
          ref={inputName}
          className="col-span-6"
          name="alias"
          title={t("models.apiKey.alias")}
          value={alias}
          setValue={setAlias}
          required
          autoComplete="off"
        />

        <InputDate
          disabled={!canUpdate}
          className="col-span-6"
          name="expires"
          title={t("models.apiKey.expires")}
          value={expires}
          onChange={setExpires}
          hint={
            <>
              {expires && (
                <button type="button" onClick={() => setExpires(undefined)} className="text-xs text-muted-foreground hover:text-red-500">
                  {t("shared.remove")}
                </button>
              )}
            </>
          }
        />

        <div className="col-span-12 flex flex-col">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="shadow-xs overflow-hidden border border-border sm:rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-secondary">
                    <tr>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <div>{t("models.entity.object")}</div>
                        </div>
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                        {t("models.apiKey.create")}
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                        {t("models.apiKey.read")}
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                        {t("models.apiKey.update")}
                      </th>
                      <th scope="col" className="select-none truncate px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground">
                        {t("models.apiKey.delete")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {entities
                      .filter((f) => (f.type === DefaultEntityTypes.AppOnly || f.type === DefaultEntityTypes.All) && f.hasApi)
                      .map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <input
                              type="hidden"
                              name="entities[]"
                              value={JSON.stringify({
                                entityId: item.id,
                                create: permissions.find((f) => f.entityId === item.id)?.create ?? false,
                                read: permissions.find((f) => f.entityId === item.id)?.read ?? false,
                                update: permissions.find((f) => f.entityId === item.id)?.update ?? false,
                                delete: permissions.find((f) => f.entityId === item.id)?.delete ?? false,
                              })}
                            />
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">/{item.slug}</td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.create ?? false}
                                onChange={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    create: e,
                                  })
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.read ?? false}
                                onChange={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    read: e,
                                  })
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.update ?? false}
                                onChange={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    update: e,
                                  })
                                }
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground">
                              <InputCheckboxInline
                                disabled={!canUpdate}
                                name=""
                                title=""
                                value={permissions.find((f) => f.entityId === item.id)?.delete ?? false}
                                onChange={(e) =>
                                  updateItemByIdx(permissions, setPermissions, idx, {
                                    delete: e,
                                  })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <InputCheckboxInline
          disabled={!canUpdate}
          className="col-span-12"
          name="active"
          title={t("models.apiKey.active")}
          value={active}
          onChange={setActive}
        />
      </div>
    </FormGroup>
  );
}
