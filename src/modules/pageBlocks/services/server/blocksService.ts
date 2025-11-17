import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { TFunction } from "i18next";
import { getServerTranslations } from "@/i18n/server";
import { load } from "../../components/blocks/app/rows/list/RowsListBlockService.server";
import { load, create } from "../../components/blocks/app/rows/new/RowsNewBlockService.server";
import { load } from "../../components/blocks/app/rows/overview/RowsOverviewBlockService.server";
import { load, publish } from "../../components/blocks/marketing/blog/post/BlogPostBlockService.server";
import { load } from "../../components/blocks/marketing/blog/posts/BlogPostsBlockService.server";
import { load } from "../../components/blocks/marketing/community/CommunityBlockService.server";
import { load, subscribe } from "../../components/blocks/marketing/pricing/PricingBlockService.server";
import { PageLoaderData } from "../../dtos/PageBlockData";
import { PageBlockDto } from "../../dtos/PageBlockDto";

export async function load({ page, request, params, t }: { page: PageLoaderData; request: Request; params: IServerComponentsProps; t: TFunction }) {
  const resolvedParams = (await params.params) || {};
  await Promise.all(
    page.blocks.map(async (block) => {
      return await loadBlock({ request, params: resolvedParams, t, block, page });
    })
  );
  return page;
}
interface LoadBlockArgs {
  request: Request;
  params: { [key: string]: string };
  t: TFunction;
  block: PageBlockDto;
  page?: PageLoaderData;
}

export async function loadBlock({ request, params, t, block, page }: LoadBlockArgs) {
  // try {
  const args = { request, params, t, block };
  if (block.community) {
    block.community.data = await load(args);
  } else if (block.pricing) {
    block.pricing.data = await load(args);
  } else if (block.blogPosts) {
    block.blogPosts.data = await load(args);
  } else if (block.blogPost) {
    block.blogPost.data = await load(args);
    if (page) {
      page.metatags = block.blogPost.data.metaTags ?? [];
    }
  } else if (block.rowsList) {
    block.rowsList.data = await load(args);
  } else if (block.rowsNew) {
    block.rowsNew.data = await load(args);
  } else if (block.rowsOverview) {
    block.rowsOverview.data = await load(args);
  }
  // } catch (error: any) {
  //   block.error = error.message;
  // }
}

export async function action(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  const { t } = await getServerTranslations();
  const form = await request.formData();
  const args = { request, params, t };

  switch (form.get("action")) {
    case "subscribe":
      return await subscribe({ ...args, form });
    case "publish":
      return await publish({ ...args, form });
    case "rows-action":
      return await create({ ...args, form });
    default:
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
}

