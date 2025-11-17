"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SettingSection from "@/components/ui/sections/SettingSection";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import InputSelect from "@/components/ui/input/InputSelect";
import { defaultThemes } from "@/utils/theme/defaultThemes";
import clsx from "clsx";
import InputImage from "@/components/ui/input/InputImage";
import { useRootData } from "@/lib/state/useRootData";
import JsonPropertyValuesInput from "@/modules/jsonProperties/components/JsonPropertyValuesInput";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";

type LoaderData = {
  item: PortalWithDetailsDto & { portalUrl?: string };
};

export default function PortalSettingsClient({ initialData }: { initialData: LoaderData }) {
  const { t } = useTranslation();
  const params = useParams();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;
  const [isPending, startTransition] = useTransition();

  const [item, setItem] = useState(initialData.item);

  useEffect(() => {
    setItem(initialData.item);
  }, [initialData]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success(result.success);
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    });
  };

  return (
    <EditPageLayout
      title={t("shared.settings")}
      withHome={false}
      menu={[
        {
          title: item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${item.subdomain}`),
        },
        {
          title: t("shared.settings"),
        },
      ]}
    >
      <div className="pb-10">
        <SettingSection title={t("settings.tenant.general")}>
          <form action={(formData) => handleSubmit(formData)}>
            <input type="hidden" name="action" value="edit" readOnly hidden />
            <div className="space-y-2">
              <InputText
                name="title"
                title={t("models.portal.title")}
                value={item.title}
                setValue={(e) => setItem({ ...item, title: e.toString() })}
                required
              />
              <InputText
                name="subdomain"
                title={t("models.portal.subdomain")}
                value={item.subdomain}
                setValue={(e) => setItem({ ...item, subdomain: e.toString() })}
                required
                hint={
                  <div>
                    {item.portalUrl && (
                      <Link href={item.portalUrl} target="_blank" className="underline">
                        {item.portalUrl}
                      </Link>
                    )}
                  </div>
                }
              />

              {portalsConfig?.metadata && (
                <JsonPropertyValuesInput prefix="metadata" properties={portalsConfig?.metadata} attributes={item.metadata as JsonPropertiesValuesDto} />
              )}
              <div className="flex justify-end">
                <ButtonPrimary type="submit" disabled={isPending}>{t("shared.save")}</ButtonPrimary>
              </div>
            </div>
          </form>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-border border-t"></div>
          </div>
        </div>

        <SettingSection title={"Branding"}>
          <form action={(formData) => handleSubmit(formData)}>
            <input type="hidden" name="action" value="edit-branding" readOnly hidden />
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                <div className="sm:col-span-3">
                  <InputSelect
                    name="themeColor"
                    title={t("models.portal.themeColor")}
                    defaultValue={item.themeColor ?? ""}
                    placeholder={t("shared.select") + "..."}
                    options={defaultThemes.map((item) => ({
                      name: item.name,
                      value: item.value,
                      component: (
                        <div className="flex items-center space-x-2">
                          <div
                            className={clsx(
                              `theme-${item.value}`,
                              " bg-primary text-primary inline-flex shrink-0 items-center rounded-full text-xs font-medium"
                            )}
                          >
                            <svg className={clsx("h-2 w-2")} fill="currentColor" viewBox="0 0 8 8">
                              <circle cx={4} cy={4} r={3} />
                            </svg>
                          </div>
                          <div>{item.name}</div>
                        </div>
                      ),
                    }))}
                  />
                </div>
                <div className="sm:col-span-3">
                  <InputSelect
                    name="themeScheme"
                    title={t("models.portal.themeScheme")}
                    defaultValue={item.themeScheme ?? "light"}
                    placeholder={t("shared.select") + "..."}
                    options={[
                      {
                        name: t("shared.light"),
                        value: "light",
                      },
                      {
                        name: t("shared.dark"),
                        value: "dark",
                      },
                    ]}
                  />
                </div>
                <div className="sm:col-span-3">
                  <InputImage
                    name="logo"
                    title={t("models.portal.logo")}
                    value={item.brandingLogo ?? ""}
                    onChange={(e) => setItem({ ...item, brandingLogo: e.toString() })}
                  />
                </div>
                <div className="sm:col-span-3">
                  <InputImage
                    name="logoDarkMode"
                    title={t("models.portal.logoDark")}
                    value={item.brandingLogoDarkMode ?? ""}
                    onChange={(e) => setItem({ ...item, brandingLogoDarkMode: e.toString() })}
                    className="dark"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <ButtonPrimary type="submit" disabled={isPending}>{t("shared.save")}</ButtonPrimary>
              </div>
            </div>
          </form>
        </SettingSection>
      </div>
    </EditPageLayout>
  );
}
