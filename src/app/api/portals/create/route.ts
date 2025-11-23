import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";
import UrlUtils from "@/utils/app/UrlUtils";
import FormHelper from "@/lib/helpers/FormHelper";
import JsonPropertiesUtils from "@/modules/jsonProperties/utils/JsonPropertiesUtils";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const tenant = formData.get("tenant")?.toString();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant is required" }, { status: 400 });
    }

    const tenantId = await getTenantIdOrNull({
      request,
      params: { tenant },
    });

    const subdomain = UrlUtils.slugify(formData.get("subdomain")?.toString() ?? "");
    const domain = formData.get("domain")?.toString().toLowerCase().trim();
    const title = formData.get("title")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const isPublished = FormHelper.getBoolean(formData, "isPublished");
    const themeColor = formData.get("themeColor")?.toString();
    const themeScheme = formData.get("themeScheme")?.toString();
    const seoImage = formData.get("seoImage")?.toString();

    const isValidSubdomainSyntax = /^[a-z0-9-]+$/i.test(subdomain);
    if (!isValidSubdomainSyntax) {
      return NextResponse.json({ error: "Invalid subdomain" }, { status: 400 });
    }

    const existingSubdomain = await db.portals.getPortalBySubdomain(subdomain);
    if (existingSubdomain) {
      return NextResponse.json({ error: "Subdomain taken" }, { status: 400 });
    }

    const existingDomain = domain ? await db.portals.getPortalByDomain(domain) : null;
    if (existingDomain) {
      return NextResponse.json({ error: "Domain taken" }, { status: 400 });
    }

    const appConfiguration = await db.appConfiguration.getAppConfiguration();
    const metadata = JsonPropertiesUtils.getValuesFromForm({
      form: formData,
      properties: appConfiguration.portals?.metadata || [],
      prefix: "metadata",
    });

    const item = await db.portals.createPortal({
      tenantId,
      name: title,
      subdomain,
      domain: domain || null,
      isPublished: isPublished || true,
      stripeAccountId: null,
      metadata,
      themeColor: themeColor || null,
      themeScheme: themeScheme || null,
      seoTitle: title,
      seoDescription: description,
      seoImage: seoImage || null,
      seoThumbnail: null,
      seoTwitterCreator: null,
      seoTwitterSite: null,
      seoKeywords: null,
      authRequireEmailVerification: false,
      authRequireOrganization: false,
      authRequireName: false,
      analyticsSimpleAnalytics: false,
      analyticsPlausibleAnalytics: false,
      analyticsGoogleAnalyticsTrackingId: null,
      brandingLogo: null,
      brandingLogoDarkMode: null,
      brandingIcon: null,
      brandingIconDarkMode: null,
      brandingFavicon: null,
      affiliatesRewardfulApiKey: null,
      affiliatesRewardfulUrl: null,
    });

    const redirectUrl = `/app/${tenant}/portals/${item.subdomain}`;
    return NextResponse.json({
      success: "Portal created successfully",
      redirect: redirectUrl,
    });
  } catch (error: any) {
    console.error("Error creating portal:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
