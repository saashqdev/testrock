import { IFeatureFlagsDb } from "@/db/interfaces/featureFlags/IFeatureFlagsDb";
import { prisma } from "@/db/config/prisma/database";
import { FeatureFlagsFilterType } from "@/modules/featureFlags/dtos/FeatureFlagsFilterTypes";
import { clearCacheKey } from "@/lib/services/cache.server";
import { FeatureFlagWithDetailsDto, FeatureFlagWithEventsDto } from "@/db/models/featureFlags/FeatureFlagsModel";

export class FeatureFlagsDbPrisma implements IFeatureFlagsDb {
  async getFeatureFlag(where: { name?: string; id?: string; description?: string; enabled?: boolean | undefined }) {
    return prisma.featureFlag.findFirst({
      where,
      include: {
        filters: true,
      },
    });
  }

  async getAllFeatureFlags(): Promise<FeatureFlagWithDetailsDto[]> {
    return prisma.featureFlag.findMany({
      include: {
        filters: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getFeatureFlags(where: { enabled?: boolean | undefined; forcedFlags?: string[] }): Promise<FeatureFlagWithDetailsDto[]> {
    return prisma.featureFlag.findMany({
      where: {
        OR: [{ enabled: where.enabled }, { name: { in: where.forcedFlags ?? [] } }],
      },
      include: {
        filters: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getFeatureFlagsWithEvents(where: { enabled: boolean | undefined }): Promise<FeatureFlagWithEventsDto[]> {
    return prisma.featureFlag.findMany({
      where: {
        enabled: where.enabled,
      },
      include: {
        filters: true,
        events: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createFeatureFlag(data: {
    name: string;
    description: string;
    enabled: boolean;
    filters: {
      type: FeatureFlagsFilterType;
      value: string | null;
      action?: string | null;
    }[];
  }): Promise<FeatureFlagWithDetailsDto> {
    return await prisma.featureFlag
      .create({
        data: {
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          filters: {
            create: data.filters.map((f) => ({
              type: f.type.toString(),
              value: f.value ?? null,
              action: f.action ?? null,
            })),
          },
        },
        include: {
          filters: true,
        },
      })
      .then((item) => {
        clearCacheKey(`featureFlags:enabled`);
        return item;
      });
  }

  async updateFeatureFlag(
    where: { id: string },
    data: {
      name?: string;
      description?: string;
      filters?: { type: FeatureFlagsFilterType; value: string | null; action?: string | null }[];
      enabled?: boolean;
    }
  ) {
    return await prisma.featureFlag
      .update({
        where,
        data: {
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          filters: !data.filters
            ? undefined
            : {
                deleteMany: {},
                create: data.filters.map((f) => ({
                  type: f.type.toString(),
                  value: f.value ?? null,
                  action: f.action ?? null,
                })),
              },
        },
        include: {
          filters: true,
        },
      })
      .then((flag) => {
        clearCacheKey(`featureFlags:enabled`);
        return flag;
      });
  }

  async deleteFeatureFlag(where: { id: string }): Promise<FeatureFlagWithDetailsDto> {
    return await prisma.featureFlag
      .delete({
        where,
        include: {
          filters: true,
        },
      })
      .then((item) => {
        clearCacheKey(`featureFlags:enabled`);
        return item;
      });
  }
}
