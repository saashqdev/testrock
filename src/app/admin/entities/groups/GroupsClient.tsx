"use client";

import { useTranslation } from "react-i18next";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import OrderListButtons from "@/components/ui/sort/OrderListButtons";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import { ReactNode } from "react";

interface EntityGroupsClientProps {
  items: EntityGroupWithDetailsDto[];
  children?: ReactNode;
}

export default function EntityGroupsClient({ items, children }: EntityGroupsClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">Entity Groups</h3>
          <div className="flex items-center space-x-2">
            <ButtonPrimary to="groups/new" disabled={!getUserHasPermission(appOrAdminData, "admin.entities.create")}>
              {t("shared.new")}
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <TableSimple
        items={items}
        headers={[
          {
            name: "order",
            title: "Order",
            value: (_item, idx) => (
              <div>
                <OrderListButtons index={idx} items={items.map((f) => ({ ...f, order: f.order ?? 0 }))} editable={true} />
              </div>
            ),
          },
          {
            name: "group",
            title: "Group",
            value: (item) => (
              <Link href={item.id} className="hover:underline">
                <span className="font-medium">{t(item.title)}</span> <span className="text-muted-foreground text-xs italic">({item.slug})</span>
              </Link>
            ),
          },
          {
            name: "section",
            title: "Section",
            value: (item) => <div>{item.section}</div>,
          },
          {
            name: "collapsible",
            title: "Collapsible",
            value: (i) => (i.collapsible ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-gray-300" />),
          },
          {
            name: "entities",
            title: "Entities",
            className: "w-full",
            value: (i) => (
              <ul className="list-disc">
                {i.entities.map((f) => (
                  <li key={f.id}>
                    <div>
                      {t(f.entity.title)} {f.allView && <span className="text-muted-foreground text-xs italic">({f.allView.title})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            name: "actions",
            title: "",
            value: (item) => (
              <Link href={item.id} className="hover:underline">
                {t("shared.edit")}
              </Link>
            ),
          },
        ]}
      />

      <SlideOverWideEmpty
        title={params.id ? "Edit Entity Group" : "New Entity Group"}
        open={pathname !== "/admin/entities/groups"}
        onClose={() => {
          router.push("/admin/entities/groups");
        }}
        overflowYScroll={true}
        size="3xl"
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty>

    </div>
  );
}
