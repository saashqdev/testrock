"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import DateCell from "@/components/ui/dates/DateCell";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import InputSearch from "@/components/ui/input/InputSearch";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import { UserInCrmDto } from "@/modules/crm/services/CrmService";

type CrmSyncClientProps = {
  users: UserInCrmDto[];
  syncAction: (formData: FormData) => Promise<{ success?: string; error?: string }>;
};

export default function CrmSyncClient({ users, syncAction }: CrmSyncClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!users) {
      return [];
    }
    return users.filter(
      (f) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.source?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.status?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  const handleSync = async () => {
    const form = new FormData();
    form.append("action", "sync");
    filteredItems().forEach((user) => {
      form.append("emails[]", user.email);
    });
    
    const result = await syncAction(form);
    
    if (result.success) {
      toast.success(result.success);
      startTransition(() => {
        router.refresh();
      });
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  function getSyncTitle() {
    const filtered = filteredItems();
    if (filtered.length === 0) {
      return "Sync";
    } else if (filtered.length === 1) {
      return "Sync 1 contact";
    } else if (filtered.length > 1) {
      return `Sync ${filtered.length} contacts`;
    }
  }

  return (
    <EditPageLayout
      title="Sync"
      withHome={false}
      buttons={
        <>
          <ButtonSecondary to="/admin/crm/sync?cache=clear">
            <ReloadIcon className="h-5 w-5" />
          </ButtonSecondary>
          <LoadingButton
            disabled={filteredItems().length === 0}
            isLoading={isPending}
            onClick={handleSync}
          >
            {getSyncTitle()}
          </LoadingButton>
        </>
      }
    >
      <div className="space-y-2 pb-20">
        <InputSearch value={searchInput} onChange={setSearchInput} />
        <TableSimple
          items={filteredItems()}
          actions={[
            {
              title: "View contact",
              onClickRoute: (_, item) => `/admin/crm/contacts/${item.contact?.id}`,
              disabled: (item) => !item.isContact,
            },
          ]}
          headers={[
            {
              name: "source",
              title: "Source",
              value: (item) => {
                if (item.source === "user") {
                  return <SimpleBadge title="User" color={Colors.BLUE} />;
                } else if (item.source === "convertkit") {
                  return <SimpleBadge title="ConvertKit" color={Colors.PINK} />;
                }
                return "?";
              },
            },
            {
              name: "status",
              title: "Status",
              value: (item) => {
                if (item.status === "synced") {
                  return <SimpleBadge title="Synced" color={Colors.GREEN} />;
                } else if (item.status === "to-create") {
                  return <SimpleBadge title="To create" color={Colors.RED} />;
                } else if (item.status === "to-update") {
                  return <SimpleBadge title="To update" color={Colors.YELLOW} />;
                }
                return <SimpleBadge title="Not synced" color={Colors.RED} />;
              },
            },
            {
              name: "user",
              title: "User",
              className: "w-full",
              value: (item) => (
                <div className="flex flex-col">
                  <div className="font-medium">{item.email}</div>
                  <div className="text-muted-foreground text-sm">
                    {item.firstName} {item.lastName}
                  </div>
                </div>
              ),
            },
            {
              name: "contact",
              title: "Contact",
              className: "w-full",
              value: (item) => {
                if (!item.contact) {
                  return null;
                }
                return (
                  <div className="flex flex-col">
                    <div className="font-medium">{item.contact.email}</div>
                    <div className="text-muted-foreground text-sm">
                      {item.contact.firstName} {item.contact.lastName}
                    </div>
                  </div>
                );
              },
            },
            {
              name: "isContact",
              title: "Is contact",
              value: (item) => (
                <div>{item.isContact ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="text-muted-foreground h-5 w-5" />}</div>
              ),
            },
            {
              name: "isMarketingSubscriber",
              title: "Marketing subscriber",
              value: (item) => (
                <div>
                  {item.contact?.marketingSubscriber ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="text-muted-foreground h-5 w-5" />}
                </div>
              ),
            },
            {
              name: "updatedAt",
              title: "Updated at",
              value: (item) => <DateCell date={item.updatedAt} />,
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
