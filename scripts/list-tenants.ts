import { db } from "@/db";

async function main() {
  console.log("Fetching all tenants...\n");
  
  const tenants = await db.tenants.adminGetAllTenantsIdsAndNames();
  
  if (tenants.length === 0) {
    console.log("No tenants found in the database.");
    return;
  }
  
  console.log(`Found ${tenants.length} tenant(s):\n`);
  
  tenants.forEach((tenant, index) => {
    console.log(`${index + 1}. Tenant: ${tenant.name}`);
    console.log(`   Slug: ${tenant.slug}`);
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Subscribe URL: http://localhost:3000/subscribe/${tenant.slug}`);
    console.log(`   App URL: http://localhost:3000/app/${tenant.slug}\n`);
  });
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
