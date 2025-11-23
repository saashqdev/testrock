import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getStripeInvoices } from "@/utils/stripe.server";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.tenant.plural")} | ${defaultSiteTags.title}`,
  });
}

export default async function AdminAccountsPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.accounts.view");
  const { t } = await getServerTranslations();
  const searchParams = await props.searchParams;

  const filterableProperties = [
    { name: "name", title: "models.tenant.name" },
    { name: "slug", title: "models.tenant.slug" },
    {
      name: "userId",
      title: "models.user.object",
      manual: true,
      options: (await db.users.adminGetAllUsersNames()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
    {
      name: "typeId",
      title: t("shared.type"),
      manual: true,
      options: [
        { value: "null", name: "- Default -" },
        ...(await db.tenantTypes.getAllTenantTypes()).map((item) => {
          return {
            value: item.id,
            name: t(item.title),
          };
        }),
      ],
    },
  ];

  // Create a mock request object or use searchParams directly
  const mockUrl = new URL("http://localhost");
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        mockUrl.searchParams.set(key, Array.isArray(value) ? value[0] : value);
      }
    });
  }
  const mockRequest = { url: mockUrl.toString() } as Request;

  const filters = getFiltersFromCurrentUrl(mockRequest, filterableProperties);
  const urlSearchParams = mockUrl.searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.tenants.adminGetAllTenantsWithUsage(filters, currentPagination);

  const tenantInvoices: any[] = [];
  await Promise.all(
    items.map(async (item) => {
      if (item.subscription?.stripeCustomerId) {
        const invoices = await getStripeInvoices(item.subscription?.stripeCustomerId);
        tenantInvoices.push(...invoices);
      }
    })
  );

  const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId: null, name: "tenantSettings" });

  return (
    <Component
      items={items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))}
      filterableProperties={filterableProperties}
      pagination={pagination}
      tenantInvoices={tenantInvoices}
      isStripeTest={process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true}
      tenantSettingsEntity={tenantSettingsEntity}
    />
  );
}
