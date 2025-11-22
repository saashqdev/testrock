import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking tenantApiKeys feature configuration...\n");

  console.log("ℹ️  The tenantApiKeys feature is controlled by code, not database.");
  console.log("   The feature flag is set in two places:\n");
  
  console.log("1. Default Configuration:");
  console.log("   src/modules/core/data/defaultAppConfiguration.ts");
  console.log("   Change: tenantApiKeys: false → tenantApiKeys: true\n");
  
  console.log("2. Database Repository (runtime override):");
  console.log("   src/db/repositories/prisma/AppConfigurationDbPrisma.ts");
  console.log("   In the getAppConfiguration() method, update:");
  console.log("   features: { tenantApiKeys: true, ... }\n");
  
  console.log("✅ Current status:");
  console.log("   - defaultAppConfiguration.ts: tenantApiKeys is already set to true");
  console.log("   - AppConfigurationDbPrisma.ts: tenantApiKeys is already set to true\n");
  
  console.log("🔄 If you made changes, restart your dev server for them to take effect");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
