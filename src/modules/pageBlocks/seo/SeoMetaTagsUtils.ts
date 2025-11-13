import { MetaTagsDto } from "@/lib/dtos/MetaTagsDto";

type SiteTags = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  thumbnail?: string;
  twitterCreator?: string;
  twitterSite?: string;
};
export const defaultSiteTags: SiteTags = {
  title: "Next.js CatStack Demo",
  description: "Build, launch, succeed, repeat with Next.js, Tailwind CSS, shadcn/ui, Prisma, Stripe, Postmark. and Resend.",
  keywords: "nextjs,saas,tailwindcss,prisma,react,typescript,boilerplate,saas-kit,saas-boilerplate,saas-starter-kit,stripe,postmark",
  image: "/img/catstack-og.png",
  thumbnail: "/img/catstack-thumbnail.jpg",
  twitterCreator: "@TheDevs",
  twitterSite: "",
};

export function getMetaTags(tags?: SiteTags): MetaTagsDto {
  return parseMetaTags({
    ...defaultSiteTags,
    ...tags,
    // ...getLinkTags(),
  });
}

function parseMetaTags(tags: SiteTags): MetaTagsDto {
  return {
    title: tags.title,
    description: tags.description,
    keywords: tags.keywords,
    openGraph: {
      title: tags.title,
      type: "website",
      images: tags.image ? [{ url: tags.image }] : [],
      description: tags.description,
    },
  };
}
