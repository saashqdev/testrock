import { db } from "@/db";
import { headers } from "next/headers";

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export async function GET() {
  const posts = await db.blog.getAllBlogPosts({ tenantId: null, published: true });

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  
  const protocol = host.includes("localhost") ? "http" : "https";
  const domain = `${protocol}://${host}`;
  const blogUrl = `${domain}/blog`;

  const rssString = `
    <rss xmlns:blogChannel="${blogUrl}" version="2.0">
      <channel>
        <title>TheRock - Blog</title>
        <link>${blogUrl}</link>
        <description>Read the latest articles about TheRock - The NextJS SaaS kit</description>
        <language>en-us</language>
        <generator>TheDevs</generator>
        <ttl>40</ttl>
        ${posts
          .map((post) =>
            `
            <item>
              <title><![CDATA[${escapeCdata(post.slug)}]]></title>
              <description><![CDATA[Blog post - ${escapeHtml(post.title)}]]></description>
              ${!post.author ? "" : `<author><![CDATA[${escapeCdata(post.author.firstName + " " + post.author.lastName)}]]></author>`}
              <pubDate>${post.createdAt.toUTCString()}</pubDate>
              <link>${blogUrl}/${post.slug}</link>
              <guid>${blogUrl}/${post.id}</guid>
            </item>
          `.trim()
          )
          .join("\n")}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(rssString)),
    },
  });
}
