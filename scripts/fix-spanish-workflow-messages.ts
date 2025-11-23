import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const spanishToEnglishMessages: Record<string, string> = {
  "Flujo completado": "Workflow completed",
  "Flujo completado exitosamente": "Workflow completed successfully",
  "Flujo ejecutado": "Workflow executed",
  "Flujo ejecutado exitosamente": "Workflow executed successfully",
  "Completado": "Completed",
  "Ejecutado": "Executed",
  "Éxito": "Success",
  "Exitoso": "Successful",
  "¡Completado!": "Completed!",
  "¡Listo!": "Done!",
  "¡Éxito!": "Success!",
};

async function fixSpanishMessages() {
  console.log("🔍 Searching for workflow blocks with Spanish messages...");

  // Get all workflow blocks
  const blocks = await prisma.workflowBlock.findMany({
    where: {
      type: "alertUser",
    },
  });

  console.log(`📊 Found ${blocks.length} alertUser blocks`);

  let updatedCount = 0;

  for (const block of blocks) {
    try {
      const input = block.input ? JSON.parse(block.input as string) : {};
      
      if (input.message) {
        const originalMessage = input.message;
        let updatedMessage = originalMessage;
        let wasUpdated = false;

        // Check if the message contains Spanish text and replace it
        for (const [spanish, english] of Object.entries(spanishToEnglishMessages)) {
          if (updatedMessage.includes(spanish)) {
            updatedMessage = updatedMessage.replace(new RegExp(spanish, "g"), english);
            wasUpdated = true;
          }
        }

        if (wasUpdated) {
          input.message = updatedMessage;
          
          await prisma.workflowBlock.update({
            where: { id: block.id },
            data: {
              input: JSON.stringify(input),
            },
          });

          console.log(`✅ Updated block ${block.id}:`);
          console.log(`   From: "${originalMessage}"`);
          console.log(`   To:   "${updatedMessage}"`);
          updatedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error updating block ${block.id}:`, error);
    }
  }

  console.log(`\n✨ Updated ${updatedCount} blocks with Spanish messages to English`);
  
  if (updatedCount === 0) {
    console.log("ℹ️  No Spanish messages found. If you're still seeing Spanish messages,");
    console.log("   they might be using different text. Check your workflows manually.");
  }
}

fixSpanishMessages()
  .then(() => {
    console.log("\n✅ Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
