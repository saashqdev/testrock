import { IPortalsDb } from "@/db/interfaces/portals/IPortalsDb";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import { PortalWithDetailsDto, PortalWithCountDto } from "@/db/models/portals/PortalsModel";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";

export class PortalsDbPrisma implements IPortalsDb {
  async getAllPortals({
    tenantId,
    filters,
    filterableProperties,
    pagination,
  }: {
    tenantId?: string | null;
    filters: FiltersDto;
    filterableProperties: FilterablePropertyDto[];
    pagination: { pageSize: number; page: number };
  }): Promise<{
    items: PortalWithCountDto[];
    pagination: PaginationDto;
  }> {
    const q = filters.query || "";

    const AND_filters: Prisma.PortalWhereInput[] = [];
    filterableProperties.forEach((filter) => {
      const value = filters.properties.find((f) => f.name === filter.name)?.value;
      if (value) {
        AND_filters.push({
          [filter.name]: value === "null" ? null : value,
        });
      }
    });

    const OR_filters: Prisma.PortalWhereInput[] = [];
    if (q) {
      OR_filters.push(
        { subdomain: { contains: q, mode: "insensitive" } },
        { domain: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } }
      );
    }

    const whereFilters: Prisma.PortalWhereInput = {};
    if (OR_filters.length > 0) {
      whereFilters.OR = OR_filters;
    }
    if (AND_filters.length > 0) {
      whereFilters.AND = AND_filters;
    }

    const items = await prisma.portal.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where: whereFilters,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        _count: {
          select: {
            users: true,
            subscriptionProducts: true,
          },
        },
      },
    });
    const totalItems = await prisma.portal.count({ where: whereFilters });
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }

  async getAllTenantPortals({ tenantId }: { tenantId: string | null }): Promise<PortalWithCountDto[]> {
    return await prisma.portal.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        _count: {
          select: {
            users: true,
            subscriptionProducts: true,
          },
        },
      },
    });
  }

  async getPortalById(tenantId: string | null, id: string): Promise<PortalWithDetailsDto | null> {
    return await prisma.portal
      .findFirstOrThrow({
        where: {
          tenantId,
          OR: [{ id }, { subdomain: id }],
        },
        include: {
          tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        },
      })
      .catch(() => null);
  }

  async getPortalBySubdomain(subdomain: string): Promise<PortalWithDetailsDto | null> {
    return await cachified({
      key: `portalBySubdomain:${subdomain}`,
      ttl: 60 * 60 * 24,
      getFreshValue: async () => {
        return prisma.portal.findUnique({
          where: { subdomain },
          include: {
            tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
          },
        });
      },
    });
  }

  async getPortalByDomain(domain: string): Promise<PortalWithDetailsDto | null> {
    return await cachified({
      key: `portalByDomain:${domain}`,
      ttl: 60 * 60 * 24,
      getFreshValue: async () => {
        return prisma.portal.findUnique({
          where: { domain },
          include: {
            tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
          },
        });
      },
    });
  }

  async createPortal(data: {
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
  }) {
    return await prisma.portal
      .create({
        data: {
          tenantId: data.tenantId,
          subdomain: data.subdomain,
          title: data.name,
          domain: data.domain ?? null,
          isPublished: data.isPublished ?? false,
          stripeAccountId: data.stripeAccountId ?? null,
          metadata: data.metadata,
          themeColor: data.themeColor ?? null,
          themeScheme: data.themeScheme ?? null,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          seoImage: data.seoImage ?? null,
          seoThumbnail: data.seoThumbnail ?? null,
          seoTwitterCreator: data.seoTwitterCreator ?? null,
          seoTwitterSite: data.seoTwitterSite ?? null,
          seoKeywords: data.seoKeywords ?? null,
          authRequireEmailVerification: data.authRequireEmailVerification ?? false,
          authRequireOrganization: data.authRequireOrganization ?? false,
          authRequireName: data.authRequireName ?? false,
          analyticsSimpleAnalytics: data.analyticsSimpleAnalytics ?? false,
          analyticsPlausibleAnalytics: data.analyticsPlausibleAnalytics ?? false,
          analyticsGoogleAnalyticsTrackingId: data.analyticsGoogleAnalyticsTrackingId ?? null,
          brandingLogo: data.brandingLogo ?? null,
          brandingLogoDarkMode: data.brandingLogoDarkMode ?? null,
          brandingIcon: data.brandingIcon ?? null,
          brandingIconDarkMode: data.brandingIconDarkMode ?? null,
          brandingFavicon: data.brandingFavicon ?? null,
          affiliatesRewardfulApiKey: data.affiliatesRewardfulApiKey ?? null,
          affiliatesRewardfulUrl: data.affiliatesRewardfulUrl ?? null,
        },
      })
      .then((item) => {
        clearCacheKey(`portalBySubdomain:${item.subdomain}`);
        clearCacheKey(`portalByDomain:${item.domain}`);
        return item;
      });
  }

  async updatePortal(
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
  ) {
    // Fetch the previous portal to clear the old cache key if subdomain changed
    const before = await prisma.portal.findUnique({ where: { id } });
    const item = await prisma.portal.update({
      where: { id },
      data: {
        subdomain: data.subdomain,
        domain: data.domain,
        title: data.title,
        isPublished: data.isPublished,
        stripeAccountId: data.stripeAccountId,
        metadata: data.metadata,
        themeColor: data.themeColor,
        themeScheme: data.themeScheme,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoImage: data.seoImage,
        seoThumbnail: data.seoThumbnail,
        seoTwitterCreator: data.seoTwitterCreator,
        seoTwitterSite: data.seoTwitterSite,
        seoKeywords: data.seoKeywords,
        authRequireEmailVerification: data.authRequireEmailVerification,
        authRequireOrganization: data.authRequireOrganization,
        authRequireName: data.authRequireName,
        analyticsSimpleAnalytics: data.analyticsSimpleAnalytics,
        analyticsPlausibleAnalytics: data.analyticsPlausibleAnalytics,
        analyticsGoogleAnalyticsTrackingId: data.analyticsGoogleAnalyticsTrackingId,
        brandingLogo: data.brandingLogo,
        brandingLogoDarkMode: data.brandingLogoDarkMode,
        brandingIcon: data.brandingIcon,
        brandingIconDarkMode: data.brandingIconDarkMode,
        brandingFavicon: data.brandingFavicon,
        affiliatesRewardfulApiKey: data.affiliatesRewardfulApiKey,
        affiliatesRewardfulUrl: data.affiliatesRewardfulUrl,
      },
    });

    if (before) {
      clearCacheKey(`portalBySubdomain:${before.subdomain}`);
    }
    clearCacheKey(`portalBySubdomain:${item.subdomain}`);
    clearCacheKey(`portalByDomain:${item.domain}`);

    if (process.env.PORTAL_SERVER_URL) {
      // post there with subdomain and domain in the body calling /api/cache/clear
      fetch(`${process.env.PORTAL_SERVER_URL}/api/cache`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: item.subdomain,
          domain: item.domain,
        }),
      })
        .then(async (response) => {
          // eslint-disable-next-line no-console
          console.log("Clearing portal cache succeeded", await response.json());
        })
        .catch(async (response) => {
          // eslint-disable-next-line no-console
          console.error("Clearing portal cache failed", response);
        });
    }
    return item;
  }

  async deletePortal(id: string) {
    return await prisma.portal
      .delete({
        where: { id },
        select: {
          tenantId: true,
          id: true,
          createdAt: true,
          updatedAt: true,
          createdByUserId: true,
          subdomain: true,
          domain: true,
          title: true,
          isPublished: true,
          stripeAccountId: true,
          metadata: true,
          themeColor: true,
          themeScheme: true,
          seoTitle: true,
          seoDescription: true,
          seoImage: true,
          seoThumbnail: true,
          seoTwitterCreator: true,
          seoTwitterSite: true,
          seoKeywords: true,
          authRequireEmailVerification: true,
          authRequireOrganization: true,
          authRequireName: true,
          analyticsSimpleAnalytics: true,
          analyticsPlausibleAnalytics: true,
          analyticsGoogleAnalyticsTrackingId: true,
          brandingLogo: true,
          brandingLogoDarkMode: true,
          brandingIcon: true,
          brandingIconDarkMode: true,
          brandingFavicon: true,
          affiliatesRewardfulApiKey: true,
          affiliatesRewardfulUrl: true,
        },
      })
      .then(async (item) => {
        clearCacheKey(`portalBySubdomain:${item.subdomain}`);
        clearCacheKey(`portalByDomain:${item.domain}`);
        await prisma.analyticsUniqueVisitor.deleteMany({ where: { portalId: id } }).catch((e) => null);
        await prisma.analyticsPageView.deleteMany({ where: { portalId: id } }).catch((e) => null);
        await prisma.analyticsEvent.deleteMany({ where: { portalId: id } }).catch((e) => null);
        return item;
      });
  }

  async countPortals(): Promise<number> {
    return await prisma.portalUser.count({});
  }
}
