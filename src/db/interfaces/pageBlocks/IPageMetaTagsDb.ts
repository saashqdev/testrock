import { Prisma } from "@prisma/client";

export interface IPageMetaTagsDb {
  getMetaTags(pageId: string | null): Promise<
    | {
        id: string;
        pageId: string | null;
        order: number | null;
        name: string;
        value: string;
      }[]
    | never[]
  >;
  createMetaTag(data: { pageId: string | null; name: string; value: string; order: number }): Promise<
    {
      page: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isPublished: boolean;
        isPublic: boolean;
      } | null;
    } & {
      id: string;
      pageId: string | null;
      order: number | null;
      name: string;
      value: string;
    }
  >;
  updateMetaTag(
    id: string,
    data: {
      value: string;
      order: number;
    }
  ): Promise<
    {
      page: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isPublished: boolean;
        isPublic: boolean;
      } | null;
    } & {
      id: string;
      pageId: string | null;
      order: number | null;
      name: string;
      value: string;
    }
  >;
  deleteMetaTags(
    page: {
      id: string;
      slug: string;
    } | null
  ): Promise<Prisma.BatchPayload>;
}
