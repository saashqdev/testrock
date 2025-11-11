import { ISurveysDb } from "@/db/interfaces/helpDesk/ISurveysDb";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";
import { prisma } from "@/db/config/prisma/database";

export class SurveysDbPrisma implements ISurveysDb {
  async getAllSurveys({ tenantId, isPublic }: { tenantId: string | null; isPublic?: boolean }): Promise<SurveyWithDetailsDto[]> {
    return await prisma.survey.findMany({
      where: {
        tenantId,
        isPublic,
      },
      include: {
        items: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSurveyById({ tenantId, id }: { tenantId: string | null; id: string }): Promise<SurveyWithDetailsDto | null> {
    return await prisma.survey.findFirst({
      where: {
        tenantId,
        id,
      },
      include: {
        items: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } },
      },
    });
  }

  async getSurveyBySlug({ tenantId, slug }: { tenantId: string | null; slug: string }): Promise<SurveyWithDetailsDto | null> {
    return await prisma.survey.findFirst({
      where: {
        tenantId,
        slug,
      },
      include: {
        items: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } },
      },
    });
  }

  async createSurvey(data: {
    tenantId: string | null;
    title: string;
    slug: string;
    description: string | null;
    isEnabled: boolean;
    isPublic: boolean;
    minSubmissions: number;
    image: string | null;
    items: {
      title: string;
      description: string | null;
      type: string;
      order: number;
      categories: string[];
      href: string | null;
      color: string;
      style: string;
      options: {
        title: string;
        // link: string | null;
        isOther: boolean;
        icon: string | null;
        shortName: string | null;
      }[];
    }[];
  }) {
    return await prisma.survey.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        isEnabled: data.isEnabled,
        isPublic: data.isPublic,
        tenantId: data.tenantId,
        minSubmissions: data.minSubmissions,
        image: data.image,
        items: {
          createMany: {
            data: data.items.map((item) => {
              return {
                title: item.title,
                description: item.description,
                type: item.type,
                order: item.order,
                categories: item.categories,
                href: item.href,
                color: item.color,
                options: item.options,
                style: item.style,
              };
            }),
          },
        },
      },
    });
  }

  async updateSurvey(
    id: string,
    data: {
      tenantId?: string | null;
      title?: string;
      slug?: string;
      description?: string | null;
      isEnabled?: boolean;
      isPublic?: boolean;
      minSubmissions?: number;
      image?: string | null;
      items: {
        title: string;
        description: string | null;
        type: string;
        order: number;
        categories: string[];
        href: string | null;
        color: string;
        style: string;
        options: {
          title: string;
          // link: string | null;
          isOther: boolean;
          icon: string | null;
          shortName: string | null;
        }[];
      }[];
    }
  ) {
    return await prisma.survey.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        isEnabled: data.isEnabled,
        isPublic: data.isPublic,
        tenantId: data.tenantId,
        minSubmissions: data.minSubmissions,
        image: data.image,
        items: {
          deleteMany: {},
          createMany: {
            data: data.items.map((item) => {
              return {
                title: item.title,
                description: item.description,
                type: item.type,
                order: item.order,
                categories: item.categories,
                href: item.href,
                color: item.color,
                options: item.options,
                style: item.style,
              };
            }),
          },
        },
      },
    });
  }
}
