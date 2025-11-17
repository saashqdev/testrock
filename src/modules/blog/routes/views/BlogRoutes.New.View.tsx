"use client";

import { useTranslation } from "react-i18next";
import PostForm from "@/components/blog/PostForm";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { LoaderData } from "../api/BlogRoutes.New.Api";
import UrlUtils from "@/utils/app/UrlUtils";
import { useParams } from "next/navigation";
import CheckPlanFeatureLimit from "@/components/core/settings/subscription/CheckPlanFeatureLimit";

interface BlogNewViewProps {
  data: LoaderData;
}

export default function BlogNewView({ data }: BlogNewViewProps) {
  const { t } = useTranslation();
  const params = useParams();
  return (
    <EditPageLayout
      title={t("blog.new")}
      withHome={false}
      menu={[
        { title: t("blog.title"), routePath: UrlUtils.getModulePath(params, `blog`) },
        { title: t("blog.new"), routePath: UrlUtils.getModulePath(params, `blog/new`) },
      ]}
    >
      <CheckPlanFeatureLimit item={data.featureUsageEntity}>
        <PostForm categories={data.categories} tags={data.tags} />
      </CheckPlanFeatureLimit>
    </EditPageLayout>
  );
}
