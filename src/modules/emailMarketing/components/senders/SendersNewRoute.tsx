"use client";

import { useParams, useRouter } from "next/navigation";
import OpenModal from "@/components/ui/modals/OpenModal";
import EmailSenderForm from "../EmailSenderForm";

export default function SendersNewRoute() {
  const params = useParams();
  const router = useRouter();
  function close() {
    router.push(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EmailSenderForm />
    </OpenModal>
  );
}
