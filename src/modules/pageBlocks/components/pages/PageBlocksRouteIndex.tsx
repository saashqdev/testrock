"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PageBlockDto } from "@/modules/pageBlocks/dtos/PageBlockDto";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { PageBlocks_Index } from "../../routes/pages/PageBlocks_Index";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import ChatGptIcon from "@/components/ui/icons/ai/ChatGptIcon";
import ChatGptSetParametersButton from "@/modules/ai/components/ChatGptSetParametersButton";
import toast from "react-hot-toast";

interface PageBlocksRouteIndexProps {
  data: PageBlocks_Index.LoaderData;
}

export default function PageBlocksRouteIndex({ data }: PageBlocksRouteIndexProps) {
  const { t } = useTranslation();
  const [actionData, setActionData] = useState<PageBlocks_Index.ActionData | null>(null);
  const appOrAdminData = useAppOrAdminData();

  const [searchParams, setSearchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const router = useRouter();

  const [blocks, setBlocks] = useState<PageBlockDto[]>(data.page.blocks);

  const confirmModalReset = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData?.success);
    } else if (actionData?.error) {
      toast.error(actionData?.error);
    }

    if (actionData?.page) {
      setBlocks(actionData?.page.blocks);
    } else if (actionData?.aiGeneratedBlocks) {
      setBlocks(actionData?.aiGeneratedBlocks);
    }
  }, [actionData]);

  function onReset() {
    confirmModalReset.current?.show(t("pages.prompts.resetBlocks.title"), t("shared.yes"), t("shared.no"), t("pages.prompts.resetBlocks.confirm"));
  }

  function onConfirmedReset() {
    const form = new FormData();
    form.set("action", "reset");
    
    fetch(window.location.pathname, {
      method: "POST",
      body: form,
    })
    .then(response => response.json())
    .then(data => {
      setActionData(data);
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error('An error occurred while resetting blocks');
    });
  }

  function onDownload() {
    const jsonBlocks = JSON.stringify(blocks, null, "\t");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonBlocks);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    const pageName = data.page.slug === "/" ? "Landing" : data.page.slug;
    downloadAnchorNode.setAttribute("download", `blocks-${pageName.toLowerCase().replace("/", "")}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // function onDelete() {
  //   const form = new FormData();
  //   form.set("action", "delete");
  //   submit(form, {
  //     method: "post",
  //   });
  // }

  function canPreview() {
    return !data.page.page || data.page.page.isPublished;
  }

  function hasChanges() {
    return data.page.page?.blocks.find((f: { id: string }) => f.id) || JSON.stringify(data.page.blocks) !== JSON.stringify(blocks);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    fetch(window.location.pathname, {
      method: "POST",
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      setActionData(data);
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error('An error occurred while saving');
    });
  }

  return (
    <form method="post" onSubmit={handleFormSubmit} className="relative h-[calc(100vh-100px)] space-y-3">
      <input type="hidden" name="action" value="save" hidden readOnly />
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} hidden readOnly />
      <div className="sticky top-0 w-full border-b border-border py-2">
        <div className="flex items-center justify-center space-x-2">
          <ChatGptSetParametersButton
            page={data.page}
            className="focus:border-accent-300 shadow-2xs focus:outline-hidden inline-flex items-center space-x-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium focus:ring-2"
            onGenerate={(info) => {
              newSearchParams.set("aiGenerateBlocks", encodeURIComponent(info));
              router.push(newSearchParams.toString());
            }}
          >
            <ChatGptIcon className="h-5 w-5" />
          </ChatGptSetParametersButton>
          <ButtonSecondary disabled={blocks.length === 0} onClick={onDownload}>
            {t("shared.download")}
          </ButtonSecondary>
          <ButtonSecondary disabled={!hasChanges() || !getUserHasPermission(appOrAdminData, "admin.pages.update")} onClick={onReset}>
            {t("shared.reset")}
          </ButtonSecondary>
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
          <ButtonPrimary type="submit" disabled={!getUserHasPermission(appOrAdminData, "admin.pages.update")}>
            {t("shared.save")}
          </ButtonPrimary>
        </div>
      </div>
      <div className="mt-2">
        <div className="h-[calc(100vh-200px)] overflow-auto rounded-md bg-background shadow-lg dark:bg-gray-900">
          <PageBlocks
            page={data.page}
            items={blocks}
            editor={{
              add: true,
              edit: true,
              remove: true,
              move: true,
              ai: true,
            }}
            onChange={(e) => setBlocks(e)}
          />
        </div>
      </div>
      <ConfirmModal ref={confirmModalReset} onYes={onConfirmedReset} />
    </form>
  );
}
