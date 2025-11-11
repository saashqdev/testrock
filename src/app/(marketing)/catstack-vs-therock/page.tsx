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
    title: `TheRock vs TheRock | ${defaultSiteTags.title}`,
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
              headline: "TheRock vs TheRock",
              subheadline: "TheRock is the production-ready SaaS boilerplate, but TheRock is remix-decoupled.",
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
  { name: "NextJS Edition", catstack: true, therock: true, href: "https://remix.run" },
  { name: "Next.js Edition", catstack: true, therock: false, href: "https://nextjs.org" },
  { name: "SvelteKit Edition", catstack: true, therock: false, href: "https://kit.svelte.dev" },
  { name: "Repository Pattern", catstack: true, therock: false },
  { name: "Prisma ORM", catstack: true, therock: true, href: "https://www.prisma.io" },
  { name: "Drizzle ORM", catstack: true, therock: false, href: "https://orm.drizzle.team" },
  { name: "Mock ORM", catstack: true, therock: false },
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
  { name: "Entity Builder", href: "https://therock.com/docs/articles/entity-builder", catstack: false, therock: true },
  { name: "Workflows", href: "https://therock.com/docs/articles/workflows", catstack: false, therock: true },
  { name: "Google & GitHub Sign-In", href: "https://therock.com/docs/articles/google-single-sign-on-integration", catstack: false, therock: true },
  { name: "GDPR management", catstack: false, therock: true },
  { name: "Blogging", href: "https://therock.com/docs/articles/blogging", catstack: false, therock: true },
  { name: "API Keys", href: "https://therock.com/docs/articles/api", catstack: false, therock: true },
  { name: "API Rate Limiting", href: "https://therock.com/docs/articles/api-rate-limiting", catstack: false, therock: true },
  { name: "B2B2B & B2B2C support", href: "https://therock.com/docs/articles/build-b2b2c-saas-applications", catstack: false, therock: true },
  { name: "Knowledge Base", href: "https://therock.com/docs/articles/knowledge-base", catstack: false, therock: true },
  { name: "In-app Notifications", href: "https://therock.com/docs/articles/notifications", catstack: false, therock: true },
  { name: "Metrics", href: "https://therock.com/docs/articles/metrics", catstack: false, therock: true },
  { name: "Email Marketing", href: "https://therock.com/docs/articles/email-marketing", catstack: false, therock: true },
  { name: "Analytics", href: "https://therock.com/docs/articles/analytics", catstack: false, therock: true },
  { name: "Onboarding", href: "https://therock.com/docs/articles/onboarding", catstack: false, therock: true },
  { name: "Feature Flags", href: "https://therock.com/docs/articles/feature-flags", catstack: false, therock: true },
  { name: "WYSIWYG and Monaco Editors", catstack: false, therock: true },
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
                    <div className="text-sm font-bold">TheRock</div>
                  </Link>
                </th>

                <th scope="col" className="truncate px-1 py-1 text-center text-sm font-semibold">
                  <Link href="https://therock.com" className="flex items-center justify-center space-x-2 hover:underline" target="_blank">
                    <svg className="h-7 w-fit text-emerald-500" xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 750 750">
                      <defs>
                        <clipPath id="a">
                          <path d="M620.02 448.418h101.19v101.191H620.02Zm0 0" />
                        </clipPath>
                        <clipPath id="b">
                          <path d="M670.613 448.418c-27.941 0-50.593 22.652-50.593 50.598 0 27.941 22.652 50.593 50.593 50.593 27.946 0 50.598-22.652 50.598-50.593 0-27.946-22.652-50.598-50.598-50.598Zm0 0" />
                        </clipPath>
                      </defs>
                      <path
                        className="text-foreground"
                        fill="currentColor"
                        d="M188.865 534.797c-23.293 0-44.168-3.781-62.625-11.344-18.45-7.562-33.195-18.754-44.235-33.578-11.043-14.82-16.867-32.672-17.468-53.547h82.578c1.219 11.805 5.305 20.809 12.265 27.016 6.957 6.2 16.032 9.297 27.22 9.297 11.5 0 20.577-2.645 27.234-7.938 6.656-5.3 9.984-12.64 9.984-22.015 0-7.864-2.652-14.368-7.953-19.516-5.293-5.144-11.797-9.379-19.516-12.703-7.71-3.332-18.672-7.113-32.89-11.344-20.575-6.351-37.368-12.707-50.375-19.062-13.012-6.352-24.204-15.727-33.579-28.125-9.375-12.407-14.062-28.594-14.062-48.563 0-29.644 10.738-52.863 32.219-69.656 21.476-16.79 49.46-25.188 83.953-25.188 35.082 0 63.363 8.399 84.844 25.188 21.476 16.793 32.976 40.164 34.5 70.11h-83.954c-.605-10.29-4.386-18.384-11.343-24.282-6.961-5.894-15.887-8.844-26.782-8.844-9.375 0-16.937 2.496-22.687 7.485-5.75 4.992-8.625 12.18-8.625 21.562 0 10.281 4.836 18.297 14.516 24.047 9.687 5.75 24.816 11.95 45.39 18.594 20.57 6.96 37.285 13.617 50.14 19.969 12.852 6.355 23.97 15.585 33.345 27.687 9.382 12.106 14.078 27.684 14.078 46.734 0 18.157-4.617 34.649-13.844 49.47-9.23 14.823-22.617 26.62-40.156 35.39-17.543 8.773-38.266 13.156-62.172 13.156ZM526.039 531.625 450.71 402.297h-49.922v129.328h-41.297V215.344h102.11c23.894 0 44.085 4.086 60.577 12.25 16.489 8.168 28.817 19.21 36.985 33.125 8.164 13.918 12.25 29.797 12.25 47.64 0 21.782-6.282 40.997-18.844 57.641-12.555 16.637-31.383 27.68-56.484 33.125l79.406 132.5Zm-125.25-162.453H461.6c22.383 0 39.172-5.52 50.36-16.562 11.195-11.04 16.796-25.79 16.796-44.25 0-18.75-5.523-33.266-16.562-43.547-11.043-10.29-27.906-15.438-50.594-15.438H400.79Zm0 0"
                      />
                      <g clipPath="url(#a)">
                        <g clipPath="url(#b)">
                          <path fill="currentColor" d="M620.02 448.418h101.19v101.191H620.02Zm0 0" />
                        </g>
                      </g>
                    </svg>
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
                    Get TheRock
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
