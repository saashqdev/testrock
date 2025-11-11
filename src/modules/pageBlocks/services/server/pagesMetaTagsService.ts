import { db } from "@/db";

export const DEFAULT_META_TAGS = [
  "title",
  "description",
  "keywords",
  "charset",
  "og:title",
  "og:type",
  "og:url",
  "og:image",
  "og:card",
  "og:creator",
  "og:site",
  "og:description",
  "twitter:image",
  "twitter:card",
  "twitter:creator",
  "twitter:site",
  "twitter:title",
  "twitter:description",
];

export async function setPageMetaTags(pageId: string | null, tags: { name: string; content: string; order: number }[]) {
  const duplicated = tags.filter((tag, index) => tags.findIndex((t) => t.name === tag.name) !== index);
  if (duplicated.length > 0) {
    throw Error(`Duplicate tags: ${duplicated.map((i) => i.name).join(", ")}`);
  }

  const allMetaTags = await db.pageMetaTags.getMetaTags(pageId);
  return await Promise.all(
    tags.map(async (tag) => {
      const existing = allMetaTags.find((t) => t.name === tag.name);
      if (existing) {
        await db.pageMetaTags.updateMetaTag(existing.id, {
          value: tag.content,
          order: tag.order,
        });
      } else {
        await db.pageMetaTags.createMetaTag({
          pageId,
          name: tag.name,
          value: tag.content,
          order: tag.order,
        });
      }
    })
  );
}
