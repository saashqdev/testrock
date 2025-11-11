import { Page, PageMetaTag, PageBlock } from "@prisma/client";

export type PageModel = {
  id: string;
  title: string;
  content: string;
};

export type PageWithDetailsDto = Page & {
  metaTags: PageMetaTag[];
  blocks: PageBlock[];
};
