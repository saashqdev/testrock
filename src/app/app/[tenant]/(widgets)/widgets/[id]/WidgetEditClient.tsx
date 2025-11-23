"use client";

import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { ClipboardIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { Input } from "@/components/ui/input";
import InputImage from "@/components/ui/input/InputImage";
import InputMultipleText from "@/components/ui/input/InputMultipleText";
import InputSelect from "@/components/ui/input/InputSelect";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SettingSection from "@/components/ui/sections/SettingSection";
import JsonPropertyValuesInput from "@/modules/jsonProperties/components/JsonPropertyValuesInput";
import { WidgetDto } from "@/modules/widgets/dtos/WidgetDto";
import UrlUtils from "@/utils/app/UrlUtils";
import { useRootData } from "@/lib/state/useRootData";
import { defaultThemes } from "@/utils/theme/defaultThemes";
import { LoaderData, ActionData } from "./page";

interface WidgetEditClientProps {
  data: LoaderData;
}

export default function WidgetEditClient({ data }: WidgetEditClientProps) {
  const { t } = useTranslation();
  const { appConfiguration } = useRootData();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [item, setItem] = useState<WidgetDto>(data.item);
  const [actionData, setActionData] = useState<ActionData | null>(null);

  const isDeleting = isPending;
  const confirmDelete = useRef<RefConfirmModal>(null);

  const textToType = `${t("shared.delete")} ${data.item.name}`;
  const [typeToConfirm, setTypeToConfirm] = useState<string>("");

  useEffect(() => {
    setItem(data.item);
  }, [data.item]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData?.error);
    } else if (actionData?.success) {
      toast.success(actionData?.success);
      router.refresh(); // Refresh server data
    }
  }, [actionData, router]);

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onConfirmDelete() {
    const form = new FormData();
    form.append("action", "delete");

    startTransition(async () => {
      try {
        const response = await fetch(window.location.href, {
          method: "POST",
          body: form,
        });

        const result = await response.json();

        if (!response.ok) {
          setActionData({ error: result.error || "An error occurred" });
        } else if (result.success) {
          if (result.redirectUrl) {
            router.push(result.redirectUrl);
          } else {
            setActionData({ success: result.success });
          }
        }
      } catch (error: any) {
        setActionData({ error: error.message });
      }
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const response = await fetch(window.location.href, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          setActionData({ error: result.error || "An error occurred" });
        } else if (result.success) {
          if (result.redirectUrl) {
            router.push(result.redirectUrl);
          } else {
            setActionData({ success: result.success });
          }
        }
      } catch (error: any) {
        setActionData({ error: error.message });
      }
    });
  };

  return (
    <EditPageLayout
      title={item.name}
      withHome={false}
      menu={[
        {
          title: t("widgets.plural"),
          routePath: UrlUtils.getModulePath(params, `widgets`),
        },
        {
          title: data.item.name,
        },
      ]}
    >
      <div className="pb-20">
        <SettingSection title="Details">
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form method="post" onSubmit={handleSubmit}>
              <input hidden type="text" name="action" value="edit" readOnly />
              <div className="">
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6 sm:col-span-6 md:col-span-6">
                      <label htmlFor="name" className="mb-1 block text-sm font-medium leading-5 text-muted-foreground">
                        {t("shared.name")}
                      </label>
                      <Input name="name" required type="text" defaultValue={data.item.name} />
                    </div>
                  </div>
                  <JsonPropertyValuesInput attributes={data.item.metadata} prefix="metadata" properties={appConfiguration.widgets.metadata || []} />
                </div>
                <div className="mt-3">
                  <div className="flex justify-between">
                    <div></div>
                    <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        {/*  */}
        <SettingSection title="Embed">
          <div>
            <div className="flex items-center justify-between space-x-2">
              <div className="text-sm text-muted-foreground">
                Place the following script inside the <code>&lt;head&gt;</code> tag of your website.
              </div>
              <Button
                type="button"
                variant="outline"
                className=""
                onClick={() => {
                  navigator.clipboard.writeText(data.widgetUrl);
                  toast.success(t("shared.copied"));
                }}
              >
                <ClipboardIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <div className="mt-2">
              <InputText rows={2} className="bg-secondary" defaultValue={data.widgetUrl} readOnly />
            </div>
          </div>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        <SettingSection title="Appearance">
          <form method="post" onSubmit={handleSubmit}>
            <input type="hidden" name="action" value="edit-branding" readOnly hidden />
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-6 sm:gap-x-3">
                <div className="sm:col-span-2">
                  <InputSelect
                    name="themeColor"
                    title="Theme Color"
                    value={item.appearance.theme}
                    onChange={(e) => {
                      setItem({
                        ...item,
                        appearance: {
                          ...item.appearance,
                          theme: e?.toString() || "",
                        },
                      });
                    }}
                    placeholder={t("shared.select") + "..."}
                    options={defaultThemes.map((item) => ({
                      name: item.name,
                      value: item.value,
                      component: (
                        <div className="flex items-center space-x-2">
                          <div
                            className={clsx(
                              `theme-${item.value}`,
                              "inline-flex flex-shrink-0 items-center rounded-full bg-primary text-xs font-medium text-primary"
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
                <div className="sm:col-span-2">
                  <InputSelect
                    name="themeScheme"
                    title="Theme Scheme"
                    value={item.appearance.mode}
                    onChange={(e) => {
                      setItem({
                        ...item,
                        appearance: {
                          ...item.appearance,
                          mode: e === "light" ? "light" : "dark",
                        },
                      });
                    }}
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
                <div className="sm:col-span-2">
                  <InputSelect
                    name="position"
                    title="Position"
                    defaultValue={item.appearance.position}
                    options={[
                      {
                        name: "Bottom Right",
                        value: "bottom-right",
                      },
                      {
                        name: "Bottom Left",
                        value: "bottom-left",
                      },
                      {
                        name: "Top Right",
                        value: "top-right",
                      },
                      {
                        name: "Top Left",
                        value: "top-left",
                      },
                    ]}
                  />
                </div>
                <div className="sm:col-span-6">
                  <InputImage name="logo" title={t("shared.logo")} defaultValue={item.appearance.logo || ""} />
                </div>

                <div className="sm:col-span-3">
                  <InputMultipleText
                    name="hiddenInUrls[]"
                    title="Hide in URLs"
                    value={item.appearance.hiddenInUrls}
                    onChange={(e) => {
                      setItem({
                        ...item,
                        appearance: {
                          ...item.appearance,
                          hiddenInUrls: e.map((i) => {
                            i = i.trim();
                            return "/" + UrlUtils.slugify(i);
                          }),
                        },
                      });
                    }}
                    placeholder="/docs would hide URLs starting with /docs"
                    separator="Enter"
                  />
                </div>

                <div className="sm:col-span-3">
                  <InputMultipleText
                    name="visibleInUrls[]"
                    title="Only show in URLs"
                    value={item.appearance.visibleInUrls}
                    onChange={(e) => {
                      setItem({
                        ...item,
                        appearance: {
                          ...item.appearance,
                          visibleInUrls: e.map((i) => {
                            i = i.trim();
                            return "/" + UrlUtils.slugify(i);
                          }),
                        },
                      });
                    }}
                    placeholder="/docs would show URLs starting with /docs"
                    separator="Enter"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
              </div>
            </div>
          </form>
        </SettingSection>

        {/*Separator */}
        <div className="block">
          <div className="py-5">
            <div className="border-t border-border"></div>
          </div>
        </div>

        <SettingSection title={t("settings.danger.title")} description={t("settings.danger.description")}>
          <div className="mt-12 space-y-2 md:col-span-2 md:mt-0">
            <div>
              <InputText title={`Type "${textToType}" to confirm`} value={typeToConfirm} setValue={setTypeToConfirm} />
            </div>
            <div>
              <ButtonPrimary
                disabled={typeToConfirm !== textToType || isDeleting}
                className={clsx(isDeleting && "base-spinner")}
                destructive={true}
                onClick={onDelete}
              >
                {t("shared.delete")}
              </ButtonPrimary>
            </div>
          </div>
        </SettingSection>
      </div>

      <ConfirmModal ref={confirmDelete} destructive onYes={onConfirmDelete} />
    </EditPageLayout>
  );
}
