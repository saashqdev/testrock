import { KnowledgeBase, KnowledgeBaseArticle } from "@prisma/client";
import { KbNavLinkDto } from "../dtos/KbNavLinkDto";
import { KnowledgeBasesTemplateDto } from "../dtos/KnowledgeBasesTemplateDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import { db } from "@/db";

async function getTemplate(): Promise<KnowledgeBasesTemplateDto> {
  const template: KnowledgeBasesTemplateDto = {
    knowledgeBases: [],
    categories: [],
    articles: [],
  };
  const allKbs = await db.knowledgeBase.getAllKnowledgeBases();
  for (const kb of allKbs) {
    template.knowledgeBases.push({
      basePath: kb.basePath,
      slug: kb.slug,
      title: kb.title,
      description: kb.description,
      defaultLanguage: kb.defaultLanguage,
      layout: kb.layout,
      color: kb.color,
      enabled: kb.enabled,
      languages: JSON.parse(kb.languages) as string[],
      links: JSON.parse(kb.links) as KbNavLinkDto[],
      logo: kb.logo,
      seoImage: kb.seoImage,
    });
    const allCategories = await db.kbCategories.getAllKnowledgeBaseCategories({
      knowledgeBaseSlug: kb.slug,
      language: undefined,
    });
    for (const category of allCategories) {
      template.categories.push({
        knowledgeBaseSlug: kb.slug,
        slug: category.slug,
        order: category.order,
        title: category.title,
        description: category.description,
        icon: category.icon,
        language: category.language,
        seoImage: category.seoImage,
        sections: category.sections.map((section: any) => ({
          order: section.order,
          title: section.title,
          description: section.description,
        })),
      });
    }
    const allArticles = await db.kbArticles.getAllKnowledgeBaseArticles({
      knowledgeBaseSlug: kb.slug,
      language: undefined,
    });
    for (const article of allArticles) {
      template.articles.push({
        knowledgeBaseSlug: kb.slug,
        categorySlug: article.category?.slug ?? null,
        categorySectionOrder: article.section?.order ?? null,
        slug: article.slug,
        title: article.title,
        description: article.description,
        order: article.order,
        contentDraft: article.contentDraft,
        contentPublished: article.contentPublished,
        contentPublishedAsText: article.contentPublishedAsText,
        contentType: article.contentType,
        language: article.language,
        featuredOrder: article.featuredOrder,
        seoImage: article.seoImage,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        createdByUserEmail: article.createdByUser?.email ?? null,
        relatedArticles: article.relatedArticles.map((item: { relatedArticle: { slug: string } }) => ({
          slug: item.relatedArticle.slug,
        })),
      });
    }
  }
  return template;
}

async function importKbs({ template, currentUserId }: { template: KnowledgeBasesTemplateDto; currentUserId: string }) {
  let created = {
    kbs: 0,
    categories: 0,
    sections: 0,
    articles: 0,
  };
  let updated = {
    kbs: 0,
    categories: 0,
    sections: 0,
    articles: 0,
  };
  const allUsers = await db.users.adminGetAllUsersNames();
  for (const kb of template.knowledgeBases) {
    if (!kb.basePath) {
      kb.basePath = "/";
    }
    let existing: KnowledgeBase | null = await db.knowledgeBase.getKnowledgeBaseBySlug(kb.slug);
    if (existing) {
      await db.knowledgeBase.updateKnowledgeBase(existing.id, {
        basePath: kb.basePath,
        slug: kb.slug,
        title: kb.title,
        description: kb.description,
        defaultLanguage: kb.defaultLanguage,
        layout: kb.layout,
        color: kb.color,
        enabled: kb.enabled,
        languages: JSON.stringify(kb.languages),
        links: JSON.stringify(kb.links),
        logo: kb.logo,
        seoImage: kb.seoImage,
      });
      updated.kbs++;
    } else {
      existing = await db.knowledgeBase.createKnowledgeBase({
        basePath: kb.basePath,
        slug: kb.slug,
        title: kb.title,
        description: kb.description,
        defaultLanguage: kb.defaultLanguage,
        layout: kb.layout,
        color: kb.color,
        enabled: kb.enabled,
        languages: JSON.stringify(kb.languages),
        links: JSON.stringify(kb.links),
        logo: kb.logo,
        seoImage: kb.seoImage,
      });
      created.kbs++;
    }

    for (const category of template.categories.filter((c) => c.knowledgeBaseSlug === kb.slug)) {
      let existingCategory: KnowledgeBaseCategoryWithDetailsDto | null = await db.kbCategories.getKbCategoryBySlug({
        knowledgeBaseId: existing.id,
        slug: category.slug,
        language: category.language,
      });
      if (existingCategory) {
        await db.kbCategories.updateKnowledgeBaseCategory(existingCategory.id, {
          title: category.title,
          order: category.order,
          description: category.description,
          icon: category.icon,
          language: category.language,
          seoImage: category.seoImage,
        });
        updated.categories++;
      } else {
        existingCategory = await db.kbCategories.createKnowledgeBaseCategory({
          knowledgeBaseId: existing.id,
          slug: category.slug,
          title: category.title,
          order: category.order,
          description: category.description,
          icon: category.icon,
          language: category.language,
          seoImage: category.seoImage,
        });
        created.categories++;
      }

      for (const section of category.sections) {
        let existingSection: { id: string; order: number; title: string; description: string } | null = null;
        if (existingCategory) {
          existingSection = existingCategory.sections.find((s) => s.order === section.order) ?? null;
        }
        if (existingSection) {
          await db.kbCategorySections.updateKnowledgeBaseCategorySection(existingSection.id, {
            title: section.title,
            description: section.description,
          });
          updated.sections++;
        } else {
          await db.kbCategorySections.createKnowledgeBaseCategorySection({
            categoryId: existingCategory?.id ?? "",
            order: section.order,
            title: section.title,
            description: section.description,
          });
          created.sections++;
        }
      }
    }

    for (const article of template.articles.filter((a) => a.knowledgeBaseSlug === kb.slug)) {
      let existingArticle: any = await db.kbArticles.getKbArticleBySlug({
        knowledgeBaseId: existing.id,
        slug: article.slug,
        language: article.language,
      });
      let category: KnowledgeBaseCategoryWithDetailsDto | null = null;
      let sectionId: string | null = null;
      if (article.categorySlug) {
        category = await db.kbCategories.getKbCategoryBySlug({
          knowledgeBaseId: existing.id,
          slug: article.categorySlug,
          language: article.language,
        });
        if (category && article.categorySectionOrder) {
          const section = category.sections.find((s) => s.order === article.categorySectionOrder);
          if (section) {
            sectionId = section.id;
          }
        }
      }
      let createdByUserId = currentUserId;
      if (article.createdByUserEmail) {
        const user = allUsers.find((f) => f.email === article.createdByUserEmail);
        if (user) {
          createdByUserId = user.id;
        }
      }
      if (existingArticle) {
        await db.kbArticles.updateKnowledgeBaseArticle(existingArticle.id, {
          categoryId: category?.id ?? null,
          sectionId: sectionId,
          slug: article.slug,
          title: article.title,
          description: article.description,
          order: article.order,
          contentDraft: article.contentDraft,
          contentPublished: article.contentPublished,
          contentPublishedAsText: article.contentPublishedAsText,
          contentType: article.contentType,
          language: article.language,
          featuredOrder: article.featuredOrder,
          createdByUserId,
          seoImage: article.seoImage,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        });
        updated.articles++;
      } else {
        existingArticle = await db.kbArticles.createKnowledgeBaseArticle({
          knowledgeBaseId: existing.id,
          categoryId: category?.id ?? null,
          sectionId: sectionId,
          slug: article.slug,
          title: article.title,
          description: article.description,
          order: article.order,
          language: article.language,
          seoImage: article.seoImage,
          contentDraft: article.contentDraft,
          contentPublished: article.contentPublished,
          contentPublishedAsText: article.contentPublishedAsText,
          contentType: article.contentType,
          featuredOrder: article.featuredOrder,
          createdByUserId,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        });
        created.articles++;
      }
    }
  }
  return {
    created,
    updated,
  };
}

export default {
  getTemplate,
  importKbs,
};
