"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { PageSettings_Index } from "../../routes/pages/PageSettings_Index";
import toast from "react-hot-toast";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";

interface PageSettingsRouteIndexProps {
  data: PageSettings_Index.LoaderData;
  updatePageAction: (formData: FormData) => Promise<void>;
  deletePageAction: (formData: FormData) => Promise<void>;
}

export default function PageSettingsRouteIndex({ 
  data, 
  updatePageAction, 
  deletePageAction 
}: PageSettingsRouteIndexProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const appOrAdminData = useAppOrAdminData();

  const confirmModalDelete = useRef<RefConfirmModal>(null);

  const [isPublished, setIsPublished] = useState(data.page.isPublished);
  const [isPublic, setIsPublic] = useState(data.page.isPublic);
  const [actionResult, setActionResult] = useState<{ success?: string; error?: string } | null>(null);

  useEffect(() => {
    if (actionResult?.error) {
      toast.error(actionResult.error);
    } else if (actionResult?.success) {
      toast.success(actionResult.success);
    }
  }, [actionResult]);

  function onDelete() {
    confirmModalDelete.current?.show(t("pages.prompts.delete.title"), t("shared.yes"), t("shared.no"), t("pages.prompts.delete.confirm"));
  }

  function onConfirmedDelete() {
    const form = new FormData();
    form.set("action", "delete");
    
    startTransition(async () => {
      try {
        await deletePageAction(form);
        toast.success("Page deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete page");
        console.error(error);
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("action", "update");
    formData.set("isPublished", isPublished.toString());
    formData.set("isPublic", isPublic.toString());
    
    startTransition(async () => {
      try {
        await updatePageAction(formData);
        toast.success("Page updated successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update page");
        console.error(error);
      }
    });
  }

  function canUpdate() {
    return getUserHasPermission(appOrAdminData, "admin.pages.update");
  }

  function canDelete() {
    return getUserHasPermission(appOrAdminData, "admin.pages.delete");
  }

  function hasChanges() {
    return data.page.isPublished !== isPublished || data.page.isPublic !== isPublic;
  }

  function canPreview() {
    return !data.page || data.page.isPublished;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 px-3">
      <input name="action" value="update" hidden readOnly />
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
        <div className="sm:col-span-6">
          <InputCheckboxWithDescription
            name="isPublished"
            value={isPublished}
            onChange={(e) => setIsPublished(Boolean(e))}
            title="Published"
            description="Page is published"
            disabled={!canUpdate()}
          />

          <InputCheckboxWithDescription
            name="isPublic"
            value={isPublic}
            onChange={(e) => setIsPublic(Boolean(e))}
            title="Public"
            description="Visible to unauthenticated users"
            disabled={!canUpdate()}
          />
        </div>
      </div>
      <div className="flex justify-between space-x-2 border-t border-border pt-3">
        <ButtonTertiary destructive disabled={!canDelete() || isPending} onClick={onDelete}>
          {t("shared.delete")}
        </ButtonTertiary>
        <div className="flex items-center space-x-2">
          <ButtonSecondary disabled={!canPreview()} to={"/" + data.page.slug.replace(/^\//, "")} target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <div>{t("shared.preview")}</div>
          </ButtonSecondary>
          <LoadingButton type="submit" disabled={!canUpdate() || !hasChanges()} isLoading={isPending}>
            {t("shared.save")}
          </LoadingButton>
        </div>
      </div>
      <ConfirmModal ref={confirmModalDelete} onYes={onConfirmedDelete} destructive />
    </form>
  );
}
