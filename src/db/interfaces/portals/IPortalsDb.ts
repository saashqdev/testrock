import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { PortalWithCountDto, PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import { Prisma } from "@prisma/client";

export interface IPortalsDb {
  getAllPortals({
    tenantId,
    filters,
    filterableProperties,
    pagination,
  }: {
    tenantId?: string | null | undefined;
    filters: FiltersDto;
    filterableProperties: FilterablePropertyDto[];
    pagination: {
      pageSize: number;
      page: number;
    };
  }): Promise<{
    items: PortalWithCountDto[];
    pagination: PaginationDto;
  }>;
  getAllTenantPortals({ tenantId }: { tenantId: string | null }): Promise<PortalWithCountDto[]>;
  getPortalById(tenantId: string | null, id: string): Promise<PortalWithDetailsDto | null>;
  getPortalBySubdomain(subdomain: string): Promise<PortalWithDetailsDto | null>;
  getPortalByDomain(domain: string): Promise<PortalWithDetailsDto | null>;
  createPortal(data: {
    tenantId: string | null;
    name: string;
    subdomain: string;
    domain?: string | null;
    isPublished?: boolean;
    stripeAccountId?: string | null;
    metadata?: JsonPropertiesValuesDto;
    themeColor?: string | null;
    themeScheme?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoImage?: string | null;
    seoThumbnail?: string | null;
    seoTwitterCreator?: string | null;
    seoTwitterSite?: string | null;
    seoKeywords?: string | null;
    authRequireEmailVerification?: boolean;
    authRequireOrganization?: boolean;
    authRequireName?: boolean;
    analyticsSimpleAnalytics?: boolean;
    analyticsPlausibleAnalytics?: boolean;
    analyticsGoogleAnalyticsTrackingId?: string | null;
    brandingLogo?: string | null;
    brandingLogoDarkMode?: string | null;
    brandingIcon?: string | null;
    brandingIconDarkMode?: string | null;
    brandingFavicon?: string | null;
    affiliatesRewardfulApiKey?: string | null;
    affiliatesRewardfulUrl?: string | null;
  }): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: string | null;
    subdomain: string;
    domain: string | null;
    title: string;
    isPublished: boolean;
    stripeAccountId: string | null;
    themeColor: string | null;
    themeScheme: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoImage: string | null;
    seoThumbnail: string | null;
    seoTwitterCreator: string | null;
    seoTwitterSite: string | null;
    seoKeywords: string | null;
    authRequireEmailVerification: boolean;
    authRequireOrganization: boolean;
    metadata: Prisma.JsonValue;
  }>;
  updatePortal(
    id: string,
    data: {
      subdomain?: string;
      domain?: string | null;
      title?: string;
      isPublished?: boolean;
      stripeAccountId?: string | null;
      metadata?: JsonPropertiesValuesDto;
      themeColor?: string | null;
      themeScheme?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      seoImage?: string | null;
      seoThumbnail?: string | null;
      seoTwitterCreator?: string | null;
      seoTwitterSite?: string | null;
      seoKeywords?: string | null;
      authRequireEmailVerification?: boolean;
      authRequireOrganization?: boolean;
      authRequireName?: boolean;
      analyticsSimpleAnalytics?: boolean;
      analyticsPlausibleAnalytics?: boolean;
      analyticsGoogleAnalyticsTrackingId?: string | null;
      brandingLogo?: string | null;
      brandingLogoDarkMode?: string | null;
      brandingIcon?: string | null;
      brandingIconDarkMode?: string | null;
      brandingFavicon?: string | null;
      affiliatesRewardfulApiKey?: string | null;
      affiliatesRewardfulUrl?: string | null;
    }
  ): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: string | null;
    subdomain: string;
    domain: string | null;
    title: string;
    isPublished: boolean;
    stripeAccountId: string | null;
    themeColor: string | null;
    themeScheme: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoImage: string | null;
    seoThumbnail: string | null;
    seoTwitterCreator: string | null;
    seoTwitterSite: string | null;
    seoKeywords: string | null;
    authRequireEmailVerification: boolean;
    authRequireOrganization: boolean;
    metadata: Prisma.JsonValue;
  }>;
  deletePortal(id: string): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: string | null;
    subdomain: string;
    domain: string | null;
    title: string;
    isPublished: boolean;
    stripeAccountId: string | null;
    themeColor: string | null;
    themeScheme: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoImage: string | null;
    seoThumbnail: string | null;
    seoTwitterCreator: string | null;
    seoTwitterSite: string | null;
    seoKeywords: string | null;
    authRequireEmailVerification: boolean;
    authRequireOrganization: boolean;
    metadata: Prisma.JsonValue;
  }>;
  countPortals(): Promise<number>;
}
