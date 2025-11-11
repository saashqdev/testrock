"use client";

import { useEffect, useState, useTransition } from "react";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ServerError from "@/components/ui/errors/ServerError";
import NotificationTemplatesTable from "@/modules/notifications/components/NotificationTemplatesTable";
import { NotificationChannelDto, NotificationChannels } from "@/modules/notifications/services/NotificationChannels";
import { IGetTemplatesData } from "@/modules/notifications/services/server/NotificationService";
import toast from "react-hot-toast";
import { handleNotificationAction } from "./actions";
import { useRouter } from "next/navigation";

type PageProps = {
  items: IGetTemplatesData | null;
};

export default function NotificationChannelsPage({ items }: PageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    let missingTemplate = false;
    NotificationChannels.forEach((i) => {
      if (!items?.data.find((t) => t.name === i.name)) {
        missingTemplate = true;
      }
    });
    if (missingTemplate) {
      setShowSetup(true);
    }
  }, [items?.data]);

  async function handleFormSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await handleNotificationAction(formData);
        
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.success);
          // Refresh the page data after successful action
          router.refresh();
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      }
    });
  }

  function onDelete(id: string) {
    const form = new FormData();
    form.append("action", "delete");
    form.append("id", id);
    handleFormSubmit(form);
  }
  function onSendPreview(item: NotificationChannelDto) {
    const form = new FormData();
    form.append("action", "send-preview");
    form.append("channel", item.name);
    handleFormSubmit(form);
  }
  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-border md:border-b md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium leading-6">Channels / Notification templates</h3>
            {!showSetup && <ButtonSecondary onClick={() => setShowSetup(true)}>Show set up instructions</ButtonSecondary>}
          </div>
        </div>

        {showSetup && <SetUpInstructions />}

        <NotificationTemplatesTable items={items} onDelete={onDelete} onSendPreview={onSendPreview} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}

function SetUpInstructions() {
  return (
    <InfoBanner title="Default In-app Notifications" text="">
      <div className="space-y-2">
        <div>
          Follow the setup instructions for notification channels.
        </div>
      </div>
    </InfoBanner>
  );
}
