import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { PageBlockDto } from "./PageBlockDto";
import { PageWithDetailsDto } from "@/db/models/pageBlocks/PagesModel";

export type PageConfiguration = {
  page: PageWithDetailsDto | null;
  name: string;
  slug: string;
  blocks: PageBlockDto[];
  metatags: MetaTagsDto;
  error?: string;
};
