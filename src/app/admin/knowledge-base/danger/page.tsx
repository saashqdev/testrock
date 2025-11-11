"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async (props: IServerComponentsProps) => {
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "reset-all-data") {
    await verifyUserHasPermission("admin.kb.delete");
    await prisma.knowledgeBaseCategory.deleteMany({});
    await prisma.knowledgeBaseArticle.deleteMany({});
    await prisma.knowledgeBase.deleteMany({});
    return Response.json({ success: "Reset successful" });
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onDelete();
  }
  function onDelete() {
    confirmDelete.current?.show("Reset all Knowledge Base data?");
  }

  function onConfirmedDelete() {
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("action", "reset-all-data");
        
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: form,
        });
        
        const data = await response.json();
        setActionData(data);
      } catch (error) {
        setActionData({ error: "An error occurred" });
      }
    });
  }
  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Danger</h1>

        <form onSubmit={handleSubmit} method="post" className="divide-y-gray-200 mt-6 space-y-8 divide-y">
          <input name="action" value="reset-all-data" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-6">
              <h2 className="text-foreground text-xl font-medium">Reset all data</h2>
              <p className="text-muted-foreground mt-1 text-sm">Delete all knowledge base data</p>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <ButtonPrimary destructive type="submit">
              Reset all data
            </ButtonPrimary>
          </div>
        </form>
      </div>
      <ActionResultModal actionData={actionData} showSuccess={false} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}
