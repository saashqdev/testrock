'use client';

import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import { PageBlockDto } from "@/modules/pageBlocks/dtos/PageBlockDto";
import { NewsletterFormSettings } from "@/modules/crm/services/CrmService";

type LoaderData = {
  blocks: PageBlockDto[];
  settings: NewsletterFormSettings;
};

export default function NewsletterClient({ data }: { data: LoaderData }) {
  return <PageBlocks items={data.blocks} />;
}
