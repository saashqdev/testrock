import { Metadata } from "next";
import { getLinkTags } from "@/modules/pageBlocks/services/server/pagesService";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const url = headersList.get("x-url") || `${process.env.SERVER_URL || "http://localhost:3000"}/api/docs`;

  const request = new Request(url, {
    headers: headersList,
  });

  const linkTags = getLinkTags(request);

  return {
    title: `API Documentation | ${process.env.APP_NAME}`,
    openGraph: {
      title: `API Documentation | ${process.env.APP_NAME}`,
    },
    // Link tags would be handled separately in Next.js layout or via other means
  };
}

export default function DocsPage() {
  return <iframe src="/swagger.html" title="API Documentation" style={{ width: "100%", height: "100vh", border: "none" }} />;
}
