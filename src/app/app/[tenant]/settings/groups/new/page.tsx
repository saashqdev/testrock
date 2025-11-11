"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import GroupForm from "@/components/core/roles/GroupForm";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import UrlUtils from "@/utils/app/UrlUtils";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";

type LoaderData = {
  tenantUsers: TenantUserWithUserDto[];
};

export default function NewGroupRoute() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<LoaderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/tenant/${params.tenant}/groups/users`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching tenant users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.tenant]);

  const handleSubmit = async (formData: FormData) => {
    try {
      // Add the action field to the form data
      formData.set('action', 'create');
      
      const response = await fetch(`/api/tenant/${params.tenant}/groups`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        router.push(UrlUtils.currentTenantUrl(params, "settings/members"));
      } else {
        const error = await response.json();
        console.error("Error creating group:", error);
        // You might want to show this error to the user
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (loading || !data) {
    return null; // or a loading spinner
  }

  return (
    <SlideOverWideEmpty
      title="Create User Group"
      open={true}
      className="sm:max-w-sm"
      onClose={() => router.push(UrlUtils.currentTenantUrl(params, "settings/members"))}
    >
      <GroupForm allUsers={data.tenantUsers} onSubmit={handleSubmit} />
    </SlideOverWideEmpty>
  );
}
