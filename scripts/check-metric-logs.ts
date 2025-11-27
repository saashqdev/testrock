import { prisma } from "@/db/config/prisma/database";

async function checkMetricLogs() {
  console.log("Checking MetricLog records in database...");
  
  const count = await prisma.metricLog.count();
  console.log(`Total MetricLog records: ${count}`);
  
  if (count > 0) {
    const sample = await prisma.metricLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: true,
        user: true,
      },
    });
    
    console.log("\nSample records:");
    sample.forEach((log, index) => {
      console.log(`\n${index + 1}. MetricLog ${log.id}:`);
      console.log(`   Created: ${log.createdAt}`);
      console.log(`   Route: ${log.route}`);
      console.log(`   URL: ${log.url}`);
      console.log(`   Function: ${log.function}`);
      console.log(`   Type: ${log.type}`);
      console.log(`   Env: ${log.env}`);
      console.log(`   Duration: ${log.duration}ms`);
      console.log(`   Tenant: ${log.tenant?.name || "null"}`);
      console.log(`   User: ${log.user?.email || "null"}`);
    });
  } else {
    console.log("\nNo MetricLog records found in database.");
    console.log("Metrics may not be enabled or no requests have been tracked yet.");
  }
  
  // Check app configuration
  const config = await prisma.appConfiguration.findFirst();
  console.log("\nApp Configuration - Metrics settings:");
  console.log(`  Metrics enabled: ${config?.metricsEnabled}`);
  console.log(`  Save to database: ${config?.metricsSaveToDatabase}`);
  console.log(`  Log to console: ${config?.metricsLogToConsole}`);
  console.log(`  Ignore URLs: ${config?.metricsIgnoreUrls || "none"}`);
}

checkMetricLogs()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
