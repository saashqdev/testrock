/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { importEntitiesFromTemplate } from "@/utils/services/server/entitiesTemplatesService";
import { COMPANY_SAMPLE_ENTITY_TEMPLATE } from "@/modules/templates/defaultEntityTemplates";

const prisma = new PrismaClient();

async function addCompanySample() {
  console.log("🌱 Creating Company - Sample entity");

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      admin: { isNot: null },
    },
  });

  if (!adminUser) {
    throw new Error("No admin user found");
  }

  try {
    await importEntitiesFromTemplate({
      template: COMPANY_SAMPLE_ENTITY_TEMPLATE,
      createdByUserId: adminUser.id,
    });
    console.log("✅ Company - Sample entity created successfully");
  } catch (error: any) {
    if (error.message.includes("Entity already exists")) {
      console.log("ℹ️ Company - Sample entity already exists");
    } else {
      console.error("❌ Error creating Company - Sample entity:", error.message);
      throw error;
    }
  }

  await prisma.$disconnect();
  console.log("✅ Script completed successfully!");
}

addCompanySample().catch((e) => {
  console.error(e);
  process.exit(1);
});
