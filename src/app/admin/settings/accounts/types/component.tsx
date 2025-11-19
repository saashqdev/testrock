"use client";

import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import TableSimple from "@/components/ui/tables/TableSimple";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import XIcon from "@/components/ui/icons/XIcon";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import LockClosedIcon from "@/components/ui/icons/LockClosedIcon";
import { useRootData } from "@/lib/state/useRootData";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import BackButtonWithTitle from "@/components/ui/buttons/BackButtonWithTitle";
import { Button } from "@/components/ui/button";

interface AccountTypesComponentProps {
  children?: React.ReactNode;
}

export default function AccountTypesComponent({ children }: AccountTypesComponentProps) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const router = useRouter();
  const params = useParams();

  const [open, setOpen] = useState(!!children);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOpen(!!children);
  }, [children]);

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    try {
      const response = await fetch("/api/admin/settings/accounts/types");
      const data = await response.json();
      setTypes(data.types || []);
    } catch (error) {
      console.error("Error fetching types:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <EditPageLayout
      title={<BackButtonWithTitle href="/admin/settings/accounts">{t("models.tenantType.plural")}</BackButtonWithTitle>}
      buttons={
        <>
          <Button type="button" variant="default" size="sm" asChild>
            <Link href="types/new">{t("shared.new")}</Link>
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {!rootData.appConfiguration.app.features.tenantTypes && <WarningBanner title={t("shared.warning")} text={"Tenant Types are not enabled."} />}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TableSimple
            items={types}
            onClickRoute={(idx, item) => item.id ? `types/${item.id}` : undefined}
            headers={[
              {
                name: "name",
                title: t("shared.title"),
                value: (item) => (
                  <div className={clsx("flex max-w-xs flex-col truncate", item.id && "cursor-pointer hover:underline")}>
                    <div className="flex items-center space-x-2">
                      {!item.id && <LockClosedIcon className="text-muted-foreground h-4 w-4" />}
                      <div>
                        {item.title} <span className="text-muted-foreground text-xs font-normal">({item.titlePlural})</span>
                      </div>
                    </div>
                    <div className="text-muted-foreground truncate text-sm">{item.description}</div>
                  </div>
                ),
                href: (item) => item.id ? `types/${item.id}` : undefined,
              },
              {
                name: "inProducts",
                title: "Plans",
                className: "w-full",
                value: (item) => <div className="max-w-md truncate">{item.subscriptionProducts?.map((f: any) => t(f.title)).join(", ") || "-"}</div>,
              },
              {
                name: "inTenants",
                title: "Accounts",
                value: (item) => item._count?.tenants,
                href(item) {
                  return "/admin/accounts?typeId=" + (item.id || "null");
                },
              },
              {
                name: "isDefault",
                title: t("shared.default"),
                value: (item) => (item.isDefault ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="text-muted-foreground h-4 w-4" />),
              },
              {
                name: "actions",
                title: "",
                value: (item) => (
                  <Fragment>
                    {item.id && (
                      <Link href={`types/${item.id}`} className="hover:underline">
                        {t("shared.edit")}
                      </Link>
                    )}
                  </Fragment>
                ),
              },
            ]}
          />
        )}
      </div>

      <SlideOverWideEmpty
        title={params.id ? "Edit Tenant Type" : "New Tenant Type"}
        open={open}
        onClose={() => {
          router.replace("/admin/settings/accounts/types");
        }}
        size="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
