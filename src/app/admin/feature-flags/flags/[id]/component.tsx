"use client";

import { FeatureFlag, FeatureFlagFilter, Role, Tenant } from "@prisma/client";
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
  const [isPending, startTransition] = useTransition();

  async function onDelete() {
    startTransition(async () => {
      const form = new FormData();
      form.set("action", "delete");
      const result = await handleFeatureFlagAction(form, id);
      
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div>
      <FeatureFlagForm item={data.item} metadata={data.metadata} onDelete={onDelete} />
    </div>
  );
}
