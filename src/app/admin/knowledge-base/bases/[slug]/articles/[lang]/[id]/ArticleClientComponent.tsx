"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import KbArticleContent from "@/modules/knowledgeBase/components/articles/KbArticleContent";
import { KbArticleDto } from "@/modules/knowledgeBase/dtos/KbArticleDto";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";

type ArticleClientComponentProps = {
  data: {
    knowledgeBase: KnowledgeBaseDto;
    item: KbArticleDto;
  };
  slug: string;
  lang: string;
  id: string;
  togglePublishAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export default function ArticleClientComponent({ data, slug, lang, id, togglePublishAction }: ArticleClientComponentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await togglePublishAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success(data.item.publishedAt ? "Article unpublished" : "Article published");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="action" value="togglePublish" hidden readOnly />
      <EditPageLayout
        title={`${data.item.title}`}
        withHome={false}
        menu={[
          { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
          { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
          { title: "Articles", routePath: `/admin/knowledge-base/bases/${slug}/articles` },
          { title: lang, routePath: `/admin/knowledge-base/bases/${slug}/articles/${lang}` },
          {
            title: data.item.title,
            routePath: `/admin/knowledge-base/bases/${slug}/articles/${lang}/${id}`,
          },
        ]}
        buttons={
          <>
            <ButtonSecondary to={`/admin/knowledge-base/bases/${slug}/articles/${lang}/${id}/settings`}>
              <div>Settings</div>
            </ButtonSecondary>
            <ButtonSecondary to={`/admin/knowledge-base/bases/${slug}/articles/${lang}/${id}/edit`}>
              <div>Edit latest</div>
            </ButtonSecondary>
            {data.item.publishedAt && (
              <ButtonSecondary to={KnowledgeBaseUtils.getArticleUrl({ kb: data.knowledgeBase, article: data.item, params: { lang } })} target="_blank">
                <div>Preview</div>
              </ButtonSecondary>
            )}
            <ButtonPrimary type="submit" destructive={!!data.item.publishedAt} disabled={isPending}>
              {data.item.publishedAt ? <div>Unpublish</div> : <div>Publish</div>}
            </ButtonPrimary>
          </>
        }
      >
        <div className="space-y-2">
          <div className="mx-auto max-w-4xl space-y-3 py-12">
            <KbArticleContent item={data.item} content={data.item.contentDraft} />
          </div>
        </div>

        <SlideOverWideEmpty
          title={"Article settings"}
          open={false}
          onClose={() => {
            router.replace(".");
          }}
          size="2xl"
          overflowYScroll={true}
        >
          <div className="-mx-1 -mt-3">
            <div className="space-y-4">{/* Add settings content here */}</div>
          </div>
        </SlideOverWideEmpty>
      </EditPageLayout>
    </form>
  );
}
