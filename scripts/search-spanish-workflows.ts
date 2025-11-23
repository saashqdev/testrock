import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function searchSpanishMessages() {
  console.log("🔍 Searching for Spanish text in workflow blocks...\n");

  // Search for common Spanish words
  const spanishWords = ["exitosamente", "completado", "ejecutado", "éxito", "flujo"];

  for (const word of spanishWords) {
    const blocks = await prisma.workflowBlock.findMany({
      where: {
        input: {
          contains: word,
          mode: "insensitive",
        },
      },
      include: {
        workflow: {
          select: {
            name: true,
          },
        },
      },
    });

    if (blocks.length > 0) {
      console.log(`📊 Found ${blocks.length} blocks containing "${word}":`);
      for (const block of blocks) {
        console.log(`\nBlock ID: ${block.id}`);
        console.log(`Workflow: ${block.workflow.name}`);
        console.log(`Type: ${block.type}`);
        console.log(`Input: ${block.input}`);
        console.log("---");
      }
    }
  }

  console.log("\n✅ Search completed");
}

searchSpanishMessages()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
