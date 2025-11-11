"use client";

import { TenantTypeForm } from "@/components/core/tenants/types/TenantTypeForm";
import { TenantTypeWithDetailsDto } from "@/db/models/accounts/TenantTypesModel";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateTenantTypeAction, deleteTenantTypeAction } from "./actions";

interface Props {
  item: TenantTypeWithDetailsDto;
  allSubscriptionProducts: SubscriptionProductDto[];
  id: string;
}

export function TenantTypeFormWrapper({ item, allSubscriptionProducts, id }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ success?: string; error?: string }>();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage(undefined);

    try {
      const action = formData.get("action")?.toString();

      if (action === "delete") {
        const result = await deleteTenantTypeAction(id);
        if (result.error) {
          setMessage({ error: result.error });
        } else if (result.success) {
          setMessage({ success: result.success });
          router.push("/admin/settings/accounts/types");
          router.refresh();
        }
      } else if (action === "edit") {
        const result = await updateTenantTypeAction(id, formData);
        if (result.error) {
          setMessage({ error: result.error });
        } else if (result.success) {
          setMessage({ success: result.success });
          router.push("/admin/settings/accounts/types");
          router.refresh();
        }
      }
    } catch (error) {
      setMessage({ error: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <TenantTypeForm
        item={item}
        allSubscriptionProducts={allSubscriptionProducts}
        onSubmit={handleSubmit}
        state={{ submitting: isSubmitting }}
        message={message}
      />
    </div>
  );
}
