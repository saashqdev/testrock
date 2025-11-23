import type { Metadata } from "next";
import type { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import NumberUtils from "@/lib/shared/NumberUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  metatags: MetaTagsDto;
  summary: {
    kbsTotal: number;
    articlesTotal: number;
    categoriesTotal: number;
    kbsViews: number;
    articlesViews: number;
    articlesUpvotes: number;
    articlesDownvotes: number;
  };
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const data: LoaderData = {
    metatags: [{ title: `Knowledge Base` }],
    summary: {
      kbsTotal: await db.knowledgeBase.countKnowledgeBases(),
      articlesTotal: await db.kbArticles.countKnowledgeBaseArticles(),
      categoriesTotal: await db.kbCategories.countKnowledgeBaseCategories(),
      kbsViews: await db.kbAnalytics.countAllKbsViews(),
      articlesViews: await db.kbAnalytics.countAllKbsArticleViews(),
      articlesUpvotes: await db.kbAnalytics.countAllKbsArticleUpvotes(),
      articlesDownvotes: await db.kbAnalytics.countAllKbsArticleDownvotes(),
    },
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await getData(props);
  return {
    title: data.metatags[0]?.title || "Knowledge Base",
  };
}

export default async function KnowledgeBasePage(props: IServerComponentsProps) {
  const data = await getData(props);
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6 text-foreground">Overview</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-3">
        <SummaryCard title="Knowledge Bases" value={data.summary.kbsTotal} />
        <SummaryCard title="Articles" value={data.summary.articlesTotal} />
        <SummaryCard title="Categories" value={data.summary.categoriesTotal} />
        <SummaryCard title="Articles Views" value={data.summary.articlesViews} />
        <SummaryCard title="Articles Upvotes" value={data.summary.articlesUpvotes} />
        <SummaryCard title="Articles Downvotes" value={data.summary.articlesDownvotes} />
      </dl>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
      <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
        <div>{title}</div>
      </dt>
      <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(value)}</dd>
    </div>
  );
}
