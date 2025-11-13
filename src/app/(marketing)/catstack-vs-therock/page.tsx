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
    title: `CatStack vs TheRock | ${defaultSiteTags.title}`,
  });
}

export default async function CatstackVsTheRock() {
  const { t } = await getServerTranslations();
  return (
    <div>
      <PageBlocks
        items={[
          { header: defaultHeader({ t }) },
          {
            heading: {
              headline: "CatStack vs TheRock",
              subheadline: "CatStack is the production-ready Nextjs 15 SaaS platform and so is TheRock.",
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
  therock: string | boolean;
};

const features: FeatureSolution[] = [
  { name: "Next.js Edition", catstack: true, therock: true, href: "https://nextjs.org" },
  { name: "Repository Pattern", catstack: true, therock: true },
  { name: "Prisma ORM", catstack: true, therock: true, href: "https://www.prisma.io" },
  { name: "shadcn/ui", catstack: true, therock: true },
  { name: "Stripe Subscriptions & Payments", catstack: true, therock: true, href: "https://stripe.com" },
  { name: "Marketing pages + SEO metatags", href: "https://therock.com/docs/articles/marketing-pages", catstack: true, therock: true },
  { name: "/admin and /app dashboards", href: "https://therock.com/docs/articles/admin-portal", catstack: true, therock: true },
  { name: "Auth, Accounts and Users Management", href: "https://therock.com/docs/articles/authentication", catstack: true, therock: true },
  { name: "Subscriptions and Payments", href: "https://therock.com/docs/articles/subscriptions", catstack: true, therock: true },
  { name: "Transactional Emails", catstack: true, therock: true },
  { name: "Page Block Builder", href: "https://therock.com/docs/articles/page-blocks", catstack: true, therock: true },
  { name: "Roles and Permissions", href: "https://therock.com/docs/articles/roles-and-permissions", catstack: true, therock: true },
  { name: "Internationalization", href: "https://therock.com/docs/articles/support-a-language", catstack: true, therock: true },
  { name: "Affiliates", href: "https://therock.com/docs/articles/affiliates", catstack: true, therock: true },
  { name: "Unit Tests", href: "https://therock.com/docs/articles/unit-tests", catstack: true, therock: true },
  { name: "Entity Builder", href: "https://therock.com/docs/articles/entity-builder", catstack: true, therock: true },
  { name: "Workflows", href: "https://therock.com/docs/articles/workflows", catstack: true, therock: true },
  { name: "Google & GitHub Sign-In", href: "https://therock.com/docs/articles/google-single-sign-on-integration", catstack: true, therock: true },
  { name: "GDPR management", catstack: true, therock: true },
  { name: "Blogging", href: "https://therock.com/docs/articles/blogging", catstack: true, therock: true },
  { name: "API Keys", href: "https://therock.com/docs/articles/api", catstack: true, therock: true },
  { name: "API Rate Limiting", href: "https://therock.com/docs/articles/api-rate-limiting", catstack: true, therock: true },
  { name: "B2B2B & B2B2C support", href: "https://therock.com/docs/articles/build-b2b2c-saas-applications", catstack: true, therock: true },
  { name: "Knowledge Base", href: "https://therock.com/docs/articles/knowledge-base", catstack: true, therock: true },
  { name: "In-app Notifications", href: "https://therock.com/docs/articles/notifications", catstack: true, therock: true },
  { name: "Metrics", href: "https://therock.com/docs/articles/metrics", catstack: true, therock: true },
  { name: "Email Marketing", href: "https://therock.com/docs/articles/email-marketing", catstack: true, therock: true },
  { name: "Analytics", href: "https://therock.com/docs/articles/analytics", catstack: true, therock: true },
  { name: "Onboarding", href: "https://therock.com/docs/articles/onboarding", catstack: true, therock: true },
  { name: "Feature Flags", href: "https://therock.com/docs/articles/feature-flags", catstack: true, therock: true },
  { name: "WYSIWYG and Monaco Editors", catstack: true, therock: true },
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
                  <Link href="https://therock.com" className="flex items-center justify-center space-x-2 hover:underline" target="_blank">
                    <IconSvg className="h-5 w-fit" />
                    <div className="text-sm font-bold">TheRock</div>
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
                    {typeof feature.therock === "string" ? (
                      feature.therock
                    ) : (
                      <div className="flex justify-center">
                        {feature.therock ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-red-500" />}
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
                    href="https://therock.com/pricing"
                    target="_blank"
                  >
                    Get TheRock
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
