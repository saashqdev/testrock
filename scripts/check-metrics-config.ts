import { prisma } from "@/db/config/prisma/database";

async function checkMetricsConfig() {
  console.log("Checking metrics configuration...\n");
  
  const config = await prisma.appConfiguration.findFirst();
  
  if (!config) {
    console.log("❌ No AppConfiguration found in database!");
    console.log("Run the app once to create the default configuration.");
    return;
  }
  
  console.log("Metrics Configuration:");
  console.log(`  metricsEnabled: ${config.metricsEnabled ?? 'undefined'}`);
  console.log(`  metricsLogToConsole: ${config.metricsLogToConsole ?? 'undefined'}`);
  console.log(`  metricsSaveToDatabase: ${config.metricsSaveToDatabase ?? 'undefined'}`);
  console.log(`  metricsIgnoreUrls: ${config.metricsIgnoreUrls ?? 'undefined'}`);
  
  console.log("\nTo enable metrics logging:");
  console.log("1. Go to http://localhost:3000/admin/metrics/settings");
  console.log("2. Check 'Enabled'");
  console.log("3. Check 'Save to database'");
  console.log("4. Click 'Save'");
  
  if (!config.metricsSaveToDatabase) {
    console.log("\n⚠️  WARNING: 'Save to database' is disabled!");
    console.log("   Metrics won't be saved even if enabled.");
  }
}

checkMetricsConfig()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
