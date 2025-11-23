"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import KbArticleForm from "@/modules/knowledgeBase/components/bases/KbArticleForm";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";

type ActionData = {
  error?: string;
};

type ArticleEditClientProps = {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseArticleWithDetailsDto;
  params: { slug: string; lang: string; id: string };
  updateArticle: (formData: FormData) => Promise<ActionData | void>;
};

export default function ArticleEditClient({ knowledgeBase, item, params, updateArticle }: ArticleEditClientProps) {
  const router = useRouter();
  const [actionData, setActionData] = useState<ActionData | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateArticle(formData);
      if (result && result.error) {
        setActionData(result);
      }
    } catch (error) {
      // The redirect will be caught here
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="action" value="edit" />
      <EditPageLayout
        title={`${item.title}`}
        withHome={false}
        menu={[
          { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
          { title: knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${knowledgeBase.slug}` },
          { title: "Articles", routePath: `/admin/knowledge-base/bases/${params.slug}/articles` },
          { title: params.lang, routePath: `/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}` },
          {
            title: item.title,
            routePath: `/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}/${params.id}`,
          },
        ]}
        buttons={
          <>
            <ButtonSecondary to={`/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}/${params.id}`}>
              <div>Cancel</div>
            </ButtonSecondary>
            <LoadingButton type="submit">
              <div>Save draft</div>
            </LoadingButton>
          </>
        }
      >
        <div className="space-y-2">
          <KbArticleForm item={item} />
        </div>

        <ActionResultModal actionData={actionData} showSuccess={false} />

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
            <div className="space-y-4"></div>
          </div>
        </SlideOverWideEmpty>
      </EditPageLayout>
    </form>
  );
}
