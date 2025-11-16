/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addSampleRow() {
  console.log("🌱 Creating sample row for Company - Sample entity");
  
  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { 
      admin: { isNot: null }
    }
  });

  if (!adminUser) {
    throw new Error("No admin user found");
  }

  // Get the entity
  const entity = await prisma.entity.findFirst({
    where: { slug: "company-sample" },
    include: {
      properties: true,
    }
  });
  
  if (!entity) {
    throw new Error("Company - Sample entity not found");
  }

  console.log(`Found entity: ${entity.title} (${entity.slug})`);

  // Check if there are already rows
  const existingRows = await prisma.row.findMany({ 
    where: { entityId: entity.id }
  });
  
  if (existingRows.length > 0) {
    console.log(`ℹ️ Entity already has ${existingRows.length} row(s)`);
    await prisma.$disconnect();
    return;
  }

  // Get property IDs
  const customTextProp = entity.properties.find((p: any) => p.name === "customText");
  const customNumberProp = entity.properties.find((p: any) => p.name === "customNumber");
  const customDateProp = entity.properties.find((p: any) => p.name === "customDate");
  const customBooleanProp = entity.properties.find((p: any) => p.name === "customBoolean");
  const customSelectProp = entity.properties.find((p: any) => p.name === "customSelect");

  if (!customTextProp || !customNumberProp || !customDateProp || !customBooleanProp || !customSelectProp) {
    throw new Error("Could not find all required properties");
  }

  // Get next folio number
  const lastRow = await prisma.row.findFirst({
    where: { entityId: entity.id },
    orderBy: { folio: 'desc' }
  });
  const nextFolio = lastRow ? lastRow.folio + 1 : 1;

  // Create a sample row
  const row = await prisma.row.create({
    data: {
      entityId: entity.id,
      tenantId: null,
      folio: nextFolio,
      createdByUserId: adminUser.id,
      values: {
        create: [
          { propertyId: customTextProp.id, textValue: "Sample Company Inc." },
          { propertyId: customNumberProp.id, numberValue: 12345 },
          { propertyId: customDateProp.id, dateValue: new Date() },
          { propertyId: customBooleanProp.id, booleanValue: true },
          { propertyId: customSelectProp.id, textValue: "option1" },
        ]
      },
      sampleCustomEntity: {
        create: {
          customText: "Sample Company Inc.",
          customNumber: 12345,
          customDate: new Date(),
          customBoolean: true,
          customSelect: "option1",
        }
      }
    }
  });

  console.log(`✅ Sample row created with ID: ${row.id}`);

  await prisma.$disconnect();
  console.log("✅ Script completed successfully!");
}

addSampleRow().catch((e) => {
  console.error(e);
  process.exit(1);
});
