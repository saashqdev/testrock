"use client";

import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppData } from "@/lib/state/useAppData";

interface GroupsComponentProps {
  data: {
    items: GroupWithDetailsDto[];
  };
}

export default function GroupsComponent({ data }: GroupsComponentProps) {
  const { t } = useTranslation();
  const appData = useAppData();
  const router = useRouter();
  const params = useParams();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">{t("models.group.plural")}</h3>
          {getUserHasPermission(appData, "app.settings.groups.full") && (
            <div className="flex items-center space-x-2">
              <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
            </div>
          )}
        </div>
      </div>

      <TableSimple
        items={data.items}
        headers={[
          {
            name: "name",
            title: t("models.group.name"),
            value: (item) => (
              <div className="flex flex-col">
                <div>{item.name}</div>
                {item.description && <div className="text-muted-foreground text-xs">{item.description}</div>}
              </div>
            ),
          },
          {
            name: "users",
            title: t("models.user.plural"),
            value: (item) => item.users?.length ?? 0,
          },
        ]}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => `${item.id}`,
          },
        ]}
      />
    </div>
  );
}
