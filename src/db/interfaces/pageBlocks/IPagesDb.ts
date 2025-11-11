import { PageWithDetailsDto } from "@/db/models/pageBlocks/PagesModel";

export interface IPagesDb {
  getPages(): Promise<PageWithDetailsDto[]>;
  getPage(id: string): Promise<PageWithDetailsDto | null>;
  getPageBySlug(slug: string): Promise<PageWithDetailsDto | null>;
  createPage(data: { slug: string; isPublished?: boolean | undefined; isPublic?: boolean | undefined }): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    isPublished: boolean;
    isPublic: boolean;
  }>;
  updatePage(
    before: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
      isPublished: boolean;
      isPublic: boolean;
    },
    data: {
      slug?: string | undefined;
      isPublished?: boolean | undefined;
      isPublic?: boolean | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    isPublished: boolean;
    isPublic: boolean;
  }>;
  deletePage(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    isPublished: boolean;
    isPublic: boolean;
  }>;
}
