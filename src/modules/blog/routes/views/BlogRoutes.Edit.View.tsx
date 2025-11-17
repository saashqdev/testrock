"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import PostForm from "@/components/blog/PostForm";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { LoaderData } from "../api/BlogRoutes.Edit.Api";
import UrlUtils from "@/utils/app/UrlUtils";

interface BlogEditViewProps {
  data: LoaderData;
}

export default function BlogEditView({ data }: BlogEditViewProps) {
  const { t } = useTranslation();
  const params = useParams();
  return (
    <EditPageLayout
      title={t("blog.edit")}
      withHome={false}
      menu={[
        { title: t("blog.title"), routePath: UrlUtils.getModulePath(params, `blog`) },
        { title: t("blog.edit"), routePath: UrlUtils.getModulePath(params, `blog/${params.id}`) },
      ]}
    >
      <PostForm item={data.item} categories={data.categories} tags={data.tags} />
    </EditPageLayout>
  );
}
