import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showAlertUserMessages() {
  console.log("🔍 Fetching all alertUser block messages...\n");

  const blocks = await prisma.workflowBlock.findMany({
    where: {
      type: "alertUser",
    },
    include: {
      workflow: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`📊 Found ${blocks.length} alertUser blocks:\n`);

  for (const block of blocks) {
    try {
      const input = block.input ? JSON.parse(block.input as string) : {};
      
      if (input.message) {
        console.log(`Block ID: ${block.id}`);
        console.log(`Workflow: ${block.workflow.name}`);
        console.log(`Message: "${input.message}"`);
        console.log(`Type: ${input.type || "info"}`);
        console.log("---");
      }
    } catch (error) {
      console.error(`❌ Error reading block ${block.id}:`, error);
    }
  }
}

showAlertUserMessages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
