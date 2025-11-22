import { Fragment } from "react";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import Link from "next/link";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import IconSvg from "@/components/brand/IconSvg";
import PageBlocks from "@/modules/pageBlocks/blocks/PageBlocks";
import { defaultHeader } from "@/modules/pageBlocks/defaultBlocks/defaultHeader";
import { defaultFooter } from "@/modules/pageBlocks/defaultBlocks/defaultFooter";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata() {
  return getMetaTags({
    title: `CatStack vs NextRock | ${defaultSiteTags.title}`,
  });
}

export default async function CatstackVsNextRock() {
  const { t } = await getServerTranslations();
  return (
    <div>
      <PageBlocks
        items={[
          { header: defaultHeader({ t }) },
          {
            heading: {
              headline: "CatStack vs NextRock",
              subheadline: "CatStack is the production-ready Nextjs 15 SaaS platform and so is NextRock.",
            },
          },
          {
            render: (
              <div className="container mx-auto max-w-3xl space-y-6 bg-background py-8">
                <CompareFeatures />
              </div>
            ),
          },
          {
            footer: defaultFooter({ t }),
          },
        ]}
      />
    </div>
  );
}

type FeatureSolution = {
  name: string | React.ReactNode;
  href?: string;
  catstack: string | boolean;
  NextRock: string | boolean;
};

const features: FeatureSolution[] = [
  { name: "Next.js Edition", catstack: true, NextRock: true, href: "https://nextjs.org" },
  { name: "Repository Pattern", catstack: true, NextRock: true },
  { name: "Prisma ORM", catstack: true, NextRock: true, href: "https://www.prisma.io" },
  { name: "shadcn/ui", catstack: true, NextRock: true },
  { name: "Stripe Subscriptions & Payments", catstack: true, NextRock: true, href: "https://stripe.com" },
  { name: "Marketing pages + SEO metatags", href: "https://NextRock.com/docs/articles/marketing-pages", catstack: true, NextRock: true },
  { name: "/admin and /app dashboards", href: "https://NextRock.com/docs/articles/admin-portal", catstack: true, NextRock: true },
  { name: "Auth, Accounts and Users Management", href: "https://NextRock.com/docs/articles/authentication", catstack: true, NextRock: true },
  { name: "Subscriptions and Payments", href: "https://NextRock.com/docs/articles/subscriptions", catstack: true, NextRock: true },
  { name: "Transactional Emails", catstack: true, NextRock: true },
  { name: "Page Block Builder", href: "https://NextRock.com/docs/articles/page-blocks", catstack: true, NextRock: true },
  { name: "Roles and Permissions", href: "https://NextRock.com/docs/articles/roles-and-permissions", catstack: true, NextRock: true },
  { name: "Internationalization", href: "https://NextRock.com/docs/articles/support-a-language", catstack: true, NextRock: true },
  { name: "Affiliates", href: "https://NextRock.com/docs/articles/affiliates", catstack: true, NextRock: true },
  { name: "Unit Tests", href: "https://NextRock.com/docs/articles/unit-tests", catstack: true, NextRock: true },
  { name: "Entity Builder", href: "https://NextRock.com/docs/articles/entity-builder", catstack: true, NextRock: true },
  { name: "Workflows", href: "https://NextRock.com/docs/articles/workflows", catstack: true, NextRock: true },
  { name: "Google & GitHub Sign-In", href: "https://NextRock.com/docs/articles/google-single-sign-on-integration", catstack: true, NextRock: true },
  { name: "GDPR management", catstack: true, NextRock: true },
  { name: "Blogging", href: "https://NextRock.com/docs/articles/blogging", catstack: true, NextRock: true },
  { name: "API Keys", href: "https://NextRock.com/docs/articles/api", catstack: true, NextRock: true },
  { name: "API Rate Limiting", href: "https://NextRock.com/docs/articles/api-rate-limiting", catstack: true, NextRock: true },
  { name: "B2B2B & B2B2C support", href: "https://NextRock.com/docs/articles/build-b2b2c-saas-applications", catstack: true, NextRock: true },
  { name: "Knowledge Base", href: "https://NextRock.com/docs/articles/knowledge-base", catstack: true, NextRock: true },
  { name: "In-app Notifications", href: "https://NextRock.com/docs/articles/notifications", catstack: true, NextRock: true },
  { name: "Metrics", href: "https://NextRock.com/docs/articles/metrics", catstack: true, NextRock: true },
  { name: "Email Marketing", href: "https://NextRock.com/docs/articles/email-marketing", catstack: true, NextRock: true },
  { name: "Analytics", href: "https://NextRock.com/docs/articles/analytics", catstack: true, NextRock: true },
  { name: "Onboarding", href: "https://NextRock.com/docs/articles/onboarding", catstack: true, NextRock: true },
  { name: "Feature Flags", href: "https://NextRock.com/docs/articles/feature-flags", catstack: true, NextRock: true },
  { name: "WYSIWYG and Monaco Editors", catstack: true, NextRock: true },
];

function CompareFeatures() {
  return (
    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden border border-border shadow ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="">
              <tr>
                <th scope="col" className="py-1 pl-2 pr-1 text-left text-sm font-semibold sm:pl-6">
                  Feature
                </th>

                <th scope="col" className="truncate px-1 py-1 text-center text-sm font-semibold">
                  <Link href="https://catstack.dev" className="flex items-center justify-center space-x-2 hover:underline" target="_blank">
                    <IconSvg className="h-5 w-fit" />
                    <div className="text-sm font-bold">CatStack</div>
                  </Link>
                </th>

                <th scope="col" className="truncate px-1 py-1 text-center text-sm font-semibold">
                  <Link href="https://NextRock.com" className="flex items-center justify-center space-x-2 hover:underline" target="_blank">
                    <IconSvg className="h-5 w-fit" />
                    <div className="text-sm font-bold">NextRock</div>
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {features.map((feature, idx) => (
                <tr key={idx}>
                  <td className="w-1/5 whitespace-nowrap py-1 pl-2 pr-1 text-sm sm:pl-6">
                    {feature.href ? (
                      <Fragment>
                        {feature.href.startsWith("http") ? (
                          <a rel="noreferrer" href={feature.href} className="underline" target="_blank">
                            {feature.name}
                          </a>
                        ) : (
                          <Link href={feature.href} className="underline">
                            {feature.name}
                          </Link>
                        )}
                      </Fragment>
                    ) : (
                      <span>{feature.name}</span>
                    )}
                  </td>
                  <td className="w-1/5 whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                    {typeof feature.catstack === "string" ? (
                      feature.catstack
                    ) : (
                      <div className="flex justify-center">
                        {feature.catstack ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-red-500" />}
                      </div>
                    )}
                  </td>
                  <td className="w-1/5 whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                    {typeof feature.NextRock === "string" ? (
                      feature.NextRock
                    ) : (
                      <div className="flex justify-center">
                        {feature.NextRock ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-red-500" />}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="w-1/5 whitespace-nowrap py-1 pl-2 pr-1 text-sm sm:pl-6"></td>
                <td className="w-1/5 whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                  <Link
                    className="focus:ring-accent-300 inline-flex w-full items-center justify-center space-x-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm focus:outline-none"
                    href="https://catstack.dev/pricing"
                    target="_blank"
                  >
                    Get CatStack
                  </Link>
                </td>
                <td className="w-1/5 whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                  <Link
                    className="focus:ring-accent-300 inline-flex w-full items-center justify-center space-x-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm focus:outline-none"
                    href="https://NextRock.com/pricing"
                    target="_blank"
                  >
                    Get NextRock
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
