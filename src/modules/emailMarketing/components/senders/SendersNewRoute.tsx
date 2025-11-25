"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useActionState } from "react";
import OpenModal from "@/components/ui/modals/OpenModal";
import EmailSenderForm from "../EmailSenderForm";
import { createEmailSenderAction } from "@/modules/emailMarketing/routes/Senders_New.actions";
import toast from "react-hot-toast";

export default function SendersNewRoute() {
  const params = useParams();
  const router = useRouter();
  const [actionData, action, pending] = useActionState(createEmailSenderAction, null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
      if (actionData.redirect && actionData.redirectUrl) {
        router.push(actionData.redirectUrl);
      }
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, router]);

  function close() {
    router.push(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }

  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EmailSenderForm action={action} pending={pending} />
    </OpenModal>
  );
}
