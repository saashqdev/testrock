"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { useRootData } from "@/lib/state/useRootData";
import JsonPropertyValuesInput from "@/modules/jsonProperties/components/JsonPropertyValuesInput";
import { useRouter } from "next/navigation";

export default function NewPortalClient() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;

  const mainInput = useRef<RefInputText>(null);

  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const [item, setItem] = useState({
    title: "",
    subdomain: "",
    domain: "",
  });

  useEffect(() => {
    const subdomain = UrlUtils.slugify(item.title);
    if (item.subdomain !== subdomain) {
      setItem({ ...item, subdomain });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.title]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/portals/create", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.success);
        if (result.redirect) {
          router.push(result.redirect);
        }
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <NewPageLayout
      title={`${t("models.portal.actions.new.title")}`}
      menu={[
        {
          title: t("models.portal.plural"),
          routePath: UrlUtils.getModulePath(params, "portals"),
        },
        {
          title: t("shared.new"),
        },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="action" value="create" readOnly />
        <input type="hidden" name="tenant" value={params.tenant as string} readOnly />
        <div className="space-y-2">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <InputText
                ref={mainInput}
                autoFocus
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
                className="rounded-r-none"
                button={
                  <div className="rounded rounded-l-none border border-l-0 bg-secondary/90 px-3 py-1">
                    <kbd className="inline-flex items-center justify-center border-border px-1 text-center font-sans text-xs font-medium text-muted-foreground">
                      .{rootData.appConfiguration.app.domain}
                    </kbd>
                  </div>
                }
                onBlur={() => setItem({ ...item, subdomain: UrlUtils.slugify(item.subdomain) })}
              />

              {portalsConfig?.metadata && <JsonPropertyValuesInput prefix="metadata" properties={portalsConfig?.metadata} attributes={{}} />}
            </div>
          </div>
          <div className="flex justify-end">
            <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
          </div>
        </div>
      </form>
    </NewPageLayout>
  );
}
