"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import NewEntityViewClient from "../NewEntityViewClient";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { UserWithNamesDto } from "@/db/models/accounts/UsersModel";

type LoaderData = {
  allTenants: TenantWithDetailsDto[];
  allUsers: UserWithNamesDto[];
  entity: EntityWithDetailsDto;
};

interface NewEntityViewSlideoverWrapperProps {
  data: LoaderData;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function NewEntityViewSlideoverWrapper({ data, searchParams }: NewEntityViewSlideoverWrapperProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const search = currentSearchParams.toString() ? `?${currentSearchParams.toString()}` : "";

  function handleClose() {
    router.push(`/admin/entities/views${search}`);
  }

  return (
    <SlideOverWideEmpty
      title={`New ${data.entity.title} view`}
      open={true}
      onClose={handleClose}
      className="sm:max-w-2xl"
      overflowYScroll={true}
    >
      <div className="-mx-1 -mt-3">
        <NewEntityViewClient data={data} />
      </div>
    </SlideOverWideEmpty>
  );
}
