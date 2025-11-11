import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";

export interface ISurveysDb {
  getAllSurveys({ tenantId, isPublic }: { tenantId: string | null; isPublic?: boolean | undefined }): Promise<SurveyWithDetailsDto[]>;
  getSurveyById({ tenantId, id }: { tenantId: string | null; id: string }): Promise<SurveyWithDetailsDto | null>;
  getSurveyBySlug({ tenantId, slug }: { tenantId: string | null; slug: string }): Promise<SurveyWithDetailsDto | null>;
  createSurvey(data: {
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
        isOther: boolean;
        icon: string | null;
        shortName: string | null;
      }[];
    }[];
  }): Promise<{
    tenantId: string | null;
    isPublic: boolean;
    id: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    isEnabled: boolean;
    minSubmissions: number;
    image: string | null;
  }>;
  updateSurvey(
    id: string,
    data: {
      tenantId?: string | null | undefined;
      title?: string | undefined;
      slug?: string | undefined;
      description?: string | null | undefined;
      isEnabled?: boolean | undefined;
      isPublic?: boolean | undefined;
      minSubmissions?: number | undefined;
      image?: string | null | undefined;
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
          isOther: boolean;
          icon: string | null;
          shortName: string | null;
        }[];
      }[];
    }
  ): Promise<{
    tenantId: string | null;
    image: string | null;
  }>;
}
