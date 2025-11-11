import { TenantTypeWithDetailsDto } from "@/db/models/accounts/TenantTypesModel";

export interface ITenantTypesDb {
  getAllTenantTypes(): Promise<TenantTypeWithDetailsDto[]>;
  getDefaultTenantTypes(): Promise<
    {
      id: string;
      createdAt: Date;
      title: string;
      description: string | null;
      updatedAt: Date;
      titlePlural: string;
      isDefault: boolean;
    }[]
  >;
  getTenantType(id: string): Promise<TenantTypeWithDetailsDto | null>;
  getTenantTypeByTitle(title: string): Promise<TenantTypeWithDetailsDto | null>;
  createTenantType(data: {
    title: string;
    titlePlural: string;
    description: string | null;
    isDefault?: boolean | undefined;
    subscriptionProducts: string[];
  }): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    description: string | null;
    updatedAt: Date;
    titlePlural: string;
    isDefault: boolean;
  }>;
  updateTenantType(
    id: string,
    data: {
      title?: string | undefined;
      titlePlural?: string | undefined;
      description?: string | null | undefined;
      isDefault?: boolean | undefined;
      subscriptionProducts?: string[] | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    description: string | null;
    updatedAt: Date;
    titlePlural: string;
    isDefault: boolean;
  }>;
  deleteTenantType(id: string): Promise<{
    id: string;
    createdAt: Date;
    title: string;
    description: string | null;
    updatedAt: Date;
    titlePlural: string;
    isDefault: boolean;
  }>;
}
