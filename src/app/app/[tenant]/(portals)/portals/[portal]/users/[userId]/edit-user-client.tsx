"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText from "@/components/ui/input/InputText";
import { toast } from "sonner";
import { PortalUserDto } from "@/modules/portals/dtos/PortalUserDto";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import UrlUtils from "@/lib/utils/UrlUtils";

type Props = {
  user: PortalUserDto;
};

export default function EditUserClient({ user: initialUser }: Props) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const router = useRouter();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      
      try {
        const response = await fetch(`/api/portals/${params.portal}/users/${user.id}/update`, {
          method: "POST",
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success(result.success);
          router.push(UrlUtils.currentTenantUrl(params, `portals/${params.portal}/users`));
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    });
  }

  async function onDelete() {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(user);
      confirmDelete.current.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
    }
  }

  async function onConfirmDelete() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/portals/${params.portal}/users/${user.id}/delete`, {
          method: "POST",
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success(result.success);
          router.push(UrlUtils.currentTenantUrl(params, `portals/${params.portal}/users`));
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="edit" readOnly />
        <div className="space-y-2">
          <InputText disabled name="email" title={t("models.user.email")} value={user.email} setValue={() => {}} />
          <InputText
            name="firstName"
            title={t("models.user.firstName")}
            value={user.firstName}
            setValue={(value) => setUser({ ...user, firstName: value.toString() })}
            required
          />
          <InputText
            name="lastName"
            title={t("models.user.lastName")}
            value={user.lastName}
            setValue={(value) => setUser({ ...user, lastName: value.toString() })}
          />
        </div>
        <div className="mt-5 flex justify-between space-x-2">
          <div>
            <ButtonTertiary destructive type="button" onClick={onDelete}>
              {t("shared.delete")}
            </ButtonTertiary>
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary type="button" onClick={() => router.back()}>
              {t("shared.cancel")}
            </ButtonSecondary>
            <LoadingButton type="submit" disabled={isPending}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </form>

      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} destructive />
    </div>
  );
}
