import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Enabling tenantApiKeys feature...\n");

  // Check if AppConfiguration exists
  const config = await prisma.appConfiguration.findFirst();

  if (!config) {
    console.log("❌ No AppConfiguration found in database");
    console.log("The feature flag is controlled by defaultAppConfiguration.ts");
    console.log("\nTo enable it, update:");
    console.log("src/modules/core/data/defaultAppConfiguration.ts");
    console.log("Change: tenantApiKeys: false → tenantApiKeys: true");
    return;
  }

  console.log("✅ Found AppConfiguration:", config.id);
  console.log("Current settings:", JSON.stringify(config.settings, null, 2));
  
  // Parse and update the settings JSON
  let settings = (config.settings as any) || {};
  if (!settings.app) settings.app = {};
  if (!settings.app.features) settings.app.features = {};
  
  settings.app.features.tenantApiKeys = true;

  await prisma.appConfiguration.update({
    where: { id: config.id },
    data: { settings },
  });

  console.log("✅ Enabled tenantApiKeys feature!");
  console.log("\n🔄 Restart your dev server for changes to take effect");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
