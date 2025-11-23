"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import UserBadge from "@/components/core/users/UserBadge";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import { PortalUserDto } from "@/modules/portals/dtos/PortalUserDto";
import UrlUtils from "@/utils/app/UrlUtils";
import DateUtils from "@/lib/shared/DateUtils";

type Props = {
  data: {
    item: PortalWithDetailsDto;
    items: PortalUserDto[];
  };
  children?: React.ReactNode;
};

export default function UsersClient({ data, children }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();

  const confirmDelete = useRef<RefConfirmModal>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(!!children);

  useEffect(() => {
    setIsSlideOverOpen(!!children);
  }, [children]);

  async function onChangePassword(user: PortalUserDto) {
    const password = prompt(t("settings.profile.changePassword"));
    if (password && confirm("Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("action", "change-password");
      form.set("id", user.id);
      form.set("password-new", password);

      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: form,
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
    }
  }

  function deleteUser(item: PortalUserDto) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
    }
  }

  async function onConfirmDeleteUser(item: PortalUserDto) {
    const form = new FormData();
    form.set("action", "delete-user");
    form.set("id", item.id);

    try {
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.success);
        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  return (
    <EditPageLayout
      title={t("models.user.plural")}
      withHome={false}
      menu={[
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: t("models.user.plural"),
        },
      ]}
      buttons={
        <>
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("settings.profile.changePassword"),
            onClick: (_, item) => onChangePassword(item),
          },
          {
            title: t("shared.delete"),
            onClick: (_, item) => deleteUser(item),
            destructive: true,
            hidden: () => true,
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => item.id,
          },
        ]}
        headers={[
          {
            name: "user",
            title: t("models.user.object"),
            value: (item) => <UserBadge item={item} withAvatar={true} />,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => (
              <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)}>
                {DateUtils.dateAgo(item.createdAt)}
              </time>
            ),
          },
        ]}
      />

      <SlideOverWideEmpty
        open={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false);
          router.push(".");
        }}
        size="2xl"
        overflowYScroll={true}
        title={params.userId ? t("shared.edit") : t("shared.new")}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty>

      <ConfirmModal ref={confirmDelete} onYes={onConfirmDeleteUser} destructive />
    </EditPageLayout>
  );
}
