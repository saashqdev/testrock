"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EntityViewForm from "@/components/entities/views/EntityViewForm";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { UserWithNamesDto } from "@/db/models/accounts/UsersModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { updateEntityView, deleteEntityView } from "./actions";
import { useToast } from "@/components/ui/use-toast";

type LoaderData = {
  item: EntityViewsWithTenantAndUserDto;
  allTenants: TenantWithDetailsDto[];
  allUsers: UserWithNamesDto[];
};

interface EntityViewClientProps {
  data: LoaderData;
}

export default function EntityViewClient({ data }: EntityViewClientProps) {
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const { toast } = useToast();

  const [entity, setEntity] = useState<EntityWithDetailsDto>();
  const [type, setType] = useState<"default" | "tenant" | "user" | "system">();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setEntity(appOrAdminData?.entities.find((f) => f.id === data.item.entityId));
    setTenantId(data.item.tenantId ?? null);
    setUserId(data.item.userId ?? null);
    if (data.item.isSystem) {
      setType("system");
    } else if (!data.item.tenantId && !data.item.userId) {
      setType("default");
    } else if (data.item.tenantId && !data.item.userId) {
      setType("tenant");
    } else if (data.item.userId) {
      setType("user");
    }
  }, [appOrAdminData, data]);

  async function handleSubmit(formData: FormData) {
    const action = formData.get("action")?.toString();
    
    // Add the item id to the form data
    formData.set("id", data.item.id);
    
    try {
      if (action === "delete") {
        const result = await deleteEntityView(formData);
        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
        // Redirect happens in the server action
      } else {
        const result = await updateEntityView(formData);
        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
        // Redirect happens in the server action
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-3">
      {entity && type && (
        <EntityViewForm
          entity={entity}
          tenantId={tenantId}
          userId={userId}
          isSystem={type === "system"}
          item={data.item}
          onClose={() => router.push(`/admin/entities/views`)}
          showViewType={true}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
