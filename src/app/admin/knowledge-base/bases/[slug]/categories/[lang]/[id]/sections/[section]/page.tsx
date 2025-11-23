"use client";

import { redirect } from "next/navigation";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import KbCategorySectionForm from "@/modules/knowledgeBase/components/bases/KbCategorySectionForm";
import { KnowledgeBaseCategorySectionWithDetailsDto } from "@/db/models/knowledgeBase/KbCategorySectionsModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetailsDto;
  item: KnowledgeBaseCategorySectionWithDetailsDto;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  const category = await db.kbCategories.getKbCategoryById(params.id!);
  if (!category) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  const item = await db.kbCategorySections.getKbCategorySectionById(params.section!);
  if (!item) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}/${params.id}`);
  }
  const data: LoaderData = {
    knowledgeBase,
    category,
    item,
  };
  return data;
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.update");
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await db.kbCategorySections.getKbCategorySectionById(params.section!);
  if (!item) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/${params.lang}/${params.id}`);
  }

  if (action === "edit") {
    await verifyUserHasPermission("admin.kb.update");
    const order = Number(form.get("order")?.toString() ?? "");
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";

    try {
      await db.kbCategorySections.updateKnowledgeBaseCategorySection(item.id, {
        order,
        title,
        description,
      });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.kb.delete");
    await db.kbCategorySections.deleteKnowledgeBaseCategorySection(item.id);
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else if (action === "set-orders") {
    await verifyUserHasPermission("admin.kb.update");
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await db.kbArticles.updateKnowledgeBaseArticle(id, {
          order: Number(order),
        });
      })
    );
    return Response.json({ updated: true });
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};

interface PageProps {
  knowledgeBase: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetailsDto;
  item: KnowledgeBaseCategorySectionWithDetailsDto;
}

export default function KbCategorySectionPage({ knowledgeBase, category, item }: PageProps) {
  const router = useRouter();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const redirectUrl = response.headers.get("Location");
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.refresh();
          }
        } else {
          const error = await response.json();
          console.error("Form submission error:", error);
        }
      } catch (error) {
        console.error("Form submission failed:", error);
      }
    });
  }

  function onDelete() {
    const form = new FormData();
    form.set("action", "delete");
    handleSubmit(form);
  }

  return (
    <div>
      <KbCategorySectionForm knowledgeBase={knowledgeBase} category={category} language={params.lang as string} item={item} onDelete={onDelete} />
    </div>
  );
}
