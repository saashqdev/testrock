"use client";

import { useRouter, useParams } from "next/navigation";
import OpenModal from "@/components/ui/modals/OpenModal";
import { Senders_Edit } from "../../routes/Senders_Edit";
import EmailSenderForm from "../EmailSenderForm";

interface SendersEditRouteProps {
  data: Senders_Edit.LoaderData;
}

export default function SendersEditRoute({ data }: SendersEditRouteProps) {
  const params = useParams();
  const router = useRouter();

  function close() {
    router.push(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }

  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EmailSenderForm item={data.item} />
    </OpenModal>
  );
}
