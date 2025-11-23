import "@/styles/globals.css";
import "@/styles/themes.css";
import { detectLanguage } from "@/i18n/server";
import { I18nProvider } from "@/i18n/i18n-context";
import { getUserInfo } from "@/lib/services/session.server";
import { Metadata } from "next";
import { getRootData } from "@/lib/services/rootData.server";
import RootDataLayout from "@/context/RootDataLayout";
import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { defaultThemeColor } from "@/lib/themes";
import { db } from "@/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const baseUrl = process.env.NEXT_PUBLIC_URL || appConfiguration.app.url || "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),
    title: getDefaultSiteTags().title,
    icons: [
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lng = await detectLanguage();
  const userInfo = await getUserInfo();
  const scheme = userInfo?.scheme || "light";
  const theme = userInfo?.theme || defaultThemeColor;
  const rootData = await getRootData();

  const htmlClasses = [scheme === "dark" ? "dark" : "", `theme-${theme}`].filter(Boolean).join(" ");

  return (
    <html lang={lng} className={htmlClasses}>
      <body>
        <I18nProvider language={lng}>
          <RootDataLayout rootData={rootData} scheme={scheme} theme={theme}>
            {children}
          </RootDataLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
