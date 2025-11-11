import { KnowledgeBaseWithDetailsDto } from "@/db/models/knowledgeBase/KnowledgeBaseModel";
export interface IKnowledgeBaseDb {
  getAllKnowledgeBases({ enabled }?: { enabled?: boolean | undefined }): Promise<KnowledgeBaseWithDetailsDto[]>;
  getAllKnowledgeBaseNames(): Promise<
    {
      id: string;
      title: string;
    }[]
  >;
  getKnowledgeBaseById(id: string): Promise<KnowledgeBaseWithDetailsDto | null>;
  getKnowledgeBaseBySlug(slug: string): Promise<KnowledgeBaseWithDetailsDto | null>;
  createKnowledgeBase(data: {
    basePath: string;
    slug: string;
    title: string;
    description: string;
    defaultLanguage: string;
    layout: string;
    color: number;
    enabled: boolean;
    languages: string;
    links: string;
    logo: string;
    seoImage: string;
  }): Promise<{
    enabled: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    basePath: string;
    slug: string;
    title: string;
    description: string;
    defaultLanguage: string;
    layout: string;
    color: number;
    languages: string;
    links: string;
    logo: string;
    seoImage: string;
  }>;
  updateKnowledgeBase(
    id: string,
    data: {
      basePath?: string | undefined;
      slug?: string | undefined;
      title?: string | undefined;
      description?: string | undefined;
      defaultLanguage?: string | undefined;
      layout?: string | undefined;
      color?: number | undefined;
      enabled?: boolean | undefined;
      languages?: string | undefined;
      links?: string | undefined;
      logo?: string | undefined;
      seoImage?: string | undefined;
    }
  ): Promise<{
    enabled: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    basePath: string;
    slug: string;
    title: string;
    description: string;
    defaultLanguage: string;
    layout: string;
    seoImage: string;
    color: number;
    languages: string;
    links: string;
    logo: string;
  }>;
  deleteKnowledgeBase(id: string): Promise<{
    enabled: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    basePath: string;
    slug: string;
    title: string;
    description: string;
    defaultLanguage: string;
    layout: string;
    color: number;
    languages: string;
    links: string;
    logo: string;
    seoImage: string;
  }>;
  countKnowledgeBases(): Promise<number>;
}
