"use client";

import { FeatureFlag, FeatureFlagFilter, Role, Tenant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import FeatureFlagForm from "@/modules/featureFlags/components/FeatureFlagForm";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { handleFeatureFlagAction } from "./actions";

type ComponentProps = {
  data: {
    item: FeatureFlag & { filters: FeatureFlagFilter[] };
    metadata: {
      users: UserDto[];
      tenants: Tenant[];
      subscriptionProducts: SubscriptionProductDto[];
      roles: Role[];
      analytics: {
        via: { name: string; count: number }[];
        httpReferrer: { name: string; count: number }[];
        browser: { name: string; count: number }[];
        os: { name: string; count: number }[];
        source: { name: string; count: number }[];
        medium: { name: string; count: number }[];
        campaign: { name: string; count: number }[];
      };
    };
  };
  id: string;
};

export default function Component({ data, id }: ComponentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleAction(prevState: any, formData: FormData) {
    const result = await handleFeatureFlagAction(formData, id);
    return result || {};
  }

  async function onDelete() {
    startTransition(async () => {
      const form = new FormData();
      form.set("action", "delete");
      const result = await handleFeatureFlagAction(form, id);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        router.push("/admin/feature-flags/flags");
      }
    });
  }

  return (
    <div>
      <FeatureFlagForm item={data.item} metadata={data.metadata} action={handleAction} onDelete={onDelete} />
    </div>
  );
}
