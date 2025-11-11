import { Prisma } from "@prisma/client";

export interface IPageBlocksDb {
  getPageBlocks(slug: string): Promise<
    {
      id: string;
      pageId: string;
      order: number;
      type: string;
      value: string;
    }[]
  >;
  getPageBlock(id: string): Promise<{
    id: string;
    pageId: string;
    order: number;
    type: string;
    value: string;
  } | null>;
  createPageBlock(data: { pageId: string; order: number; type: string; value: string }): Promise<
    {
      page: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isPublished: boolean;
        isPublic: boolean;
      };
    } & {
      id: string;
      pageId: string;
      order: number;
      type: string;
      value: string;
    }
  >;
  updatePageBlock(
    id: string,
    data: {
      order: number;
      type: string;
      value: string;
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
      };
    } & {
      id: string;
      pageId: string;
      order: number;
      type: string;
      value: string;
    }
  >;
  deletePageBlock(id: string): Promise<
    {
      page: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        isPublished: boolean;
        isPublic: boolean;
      };
    } & {
      id: string;
      pageId: string;
      order: number;
      type: string;
      value: string;
    }
  >;
  deletePageBlocks(page: { id: string; slug: string }): Promise<Prisma.BatchPayload>;
}
