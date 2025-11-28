"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TableSimple from "@/components/ui/tables/TableSimple";
import InputCheckbox from "@/components/ui/input/InputCheckbox";
import DateCell from "@/components/ui/dates/DateCell";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { KnowledgeBasesTemplateDto } from "@/modules/knowledgeBase/dtos/KnowledgeBasesTemplateDto";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";

type LoaderData = {
  metatags: MetaTagsDto;
  items: KnowledgeBaseDto[];
  template: KnowledgeBasesTemplateDto;
};

interface KnowledgeBasesClientProps {
  data: LoaderData;
}

export default function KnowledgeBasesClient({ data }: KnowledgeBasesClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<KnowledgeBaseDto[]>([]);

  function countStatus(enabled?: boolean) {
    if (enabled === undefined) {
      return data.items.length;
    }
    return data.items.filter((item) => item.enabled === enabled).length;
  }

  async function onToggle(item: KnowledgeBaseDto, enabled: boolean) {
    const formData = new FormData();
    formData.set("enabled", enabled ? "true" : "false");
    formData.set("id", item.id.toString());

    try {
      const response = await fetch("/api/admin/knowledge-base/toggle", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle knowledge base:", error);
    }
  }

  function filteredItems() {
    if (searchParams.get("status") === "active") {
      return data.items.filter((item) => item.enabled);
    }
    if (searchParams.get("status") === "inactive") {
      return data.items.filter((item) => !item.enabled);
    }
    return data.items;
  }

  function onExport() {
    const template = { ...data.template };

    if (selected.length > 0) {
      template.knowledgeBases = template.knowledgeBases.filter((item) => selected.find((i) => i.slug === item.slug));
      template.categories = template.categories.filter((item) => selected.find((i) => i.slug === item.knowledgeBaseSlug));
      template.articles = template.articles.filter((item) => selected.find((i) => i.slug === item.knowledgeBaseSlug));
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, "\t"));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kbs.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="flex items-center justify-between space-x-2">
        <div className="grow">
          <TabsWithIcons
            tabs={[
              {
                name: `All ${countStatus() ? `(${countStatus()})` : ""}`,
                href: "?",
                current: !searchParams.get("status") || searchParams.get("status") === "all",
              },
              {
                name: `Active ${countStatus(true) ? `(${countStatus(true)})` : ""}`,
                href: "?status=active",
                current: searchParams.get("status") === "active",
              },
              {
                name: `Inactive ${countStatus(false) ? `(${countStatus(false)})` : ""}`,
                href: "?status=inactive",
                current: searchParams.get("status") === "inactive",
              },
            ]}
          />
        </div>
        <div className="flex space-x-1">
          <ButtonSecondary to="bases/import">Import</ButtonSecondary>
          <ButtonSecondary onClick={onExport}>Export</ButtonSecondary>
          <ButtonPrimary to="bases/new">
            <div>New</div>
            <PlusIcon className="h-5 w-5" />
          </ButtonPrimary>
        </div>
      </div>

      <TableSimple
        items={filteredItems()}
        selectedRows={selected}
        onSelected={setSelected}
        actions={[
          {
            title: "Categories",
            onClickRoute: (_, i) => `${i.slug}/categories`,
          },
          {
            title: "Preview",
            onClickRoute: (_, i) => `/${i.slug}`,
            onClickRouteTarget: "_blank",
          },
          {
            title: "Edit",
            onClickRoute: (_, i) => `bases/edit/${i.id}`,
          },
        ]}
        headers={[
          {
            name: "status",
            title: "Status",
            value: (i) => {
              return <InputCheckbox asToggle value={i.enabled} setValue={(checked) => onToggle(i, Boolean(checked))} />;
            },
          },
          {
            name: "title",
            title: "Title",
            className: "w-full",
            value: (i) => (
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <div className="text-base font-bold">{i.title}</div>

                  <SimpleBadge color={i.color}>
                    <a target="_blank" rel="noreferrer" href={KnowledgeBaseUtils.getKbUrl({ kb: i, params })} className="hover:underline">
                      {KnowledgeBaseUtils.getKbUrl({ kb: i, params })}
                    </a>
                  </SimpleBadge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Link href={`${i.slug}/articles`} className="hover:underline">
                    {i.count.articles} articles
                  </Link>
                  <div>•</div>
                  <Link href={`${i.slug}/categories`} className="hover:underline">
                    {i.count.categories} categories
                  </Link>
                </div>
              </div>
            ),
          },
          {
            name: "views",
            title: "Views",
            value: (i) => i.count.views,
          },
          {
            name: "updatedAt",
            title: "Updated at",
            value: (i) => <DateCell date={i.updatedAt} />,
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-foreground">{"No knowledge bases"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{"Get started by creating a new knowledge base."}</p>
          </div>
        }
      />
    </div>
  );
}
