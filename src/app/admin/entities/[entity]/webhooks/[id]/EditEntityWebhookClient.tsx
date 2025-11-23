"use client";

import { EntityWebhook } from "@prisma/client";
import { useRouter } from "next/navigation";
import EntityWebhookForm from "@/components/entities/webhooks/EntityWebhookForm";
import OpenModal from "@/components/ui/modals/OpenModal";

export default function EditEntityWebhookClient({ item, entity }: { item: EntityWebhook; entity: string }) {
  const router = useRouter();

  function close() {
    router.push(`/admin/entities/${entity}/webhooks`);
  }

  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EntityWebhookForm item={item} />
    </OpenModal>
  );
}
