"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Page404 from "@/components/pages/Page404";
import UrlUtils from "@/utils/app/UrlUtils";

export default function ClientBlogPost({
  post,
  canEdit,
  tenant,
}: {
  post: any;
  canEdit: boolean;
  tenant?: string;
}) {
  const { t } = useTranslation();
  const params = useParams();

  if (!post) {
    return (
      <Page404
        withLogo={false}
        customBackButton={
          <Link href={UrlUtils.getBlogPath(params)}>
            <span aria-hidden="true"> &larr;</span> {t("blog.backToBlog")}
          </Link>
        }
      />
    );
  }

  return null;
}
