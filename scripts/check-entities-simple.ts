import { db } from "../src/db";

async function checkEntities() {
  try {
    console.log("Checking entities in database...\n");

    // Check with both flags
    const entities = await db.entities.getAllEntities(null, false);
    const entitiesIncludingSystem = await db.entities.getAllEntities(null, true);

    console.log(`Total entities (excluding system): ${entities.length}`);
    console.log(`Total entities (including system): ${entitiesIncludingSystem.length}\n`);

    if (entitiesIncludingSystem.length === 0) {
      console.log("⚠️  No entities found in database!");
      console.log("Run 'pnpm seed' to create default entities.\n");
    } else {
      console.log("Available entities:");
      entitiesIncludingSystem.forEach((e) => {
        console.log(`  - ${e.name} (slug: "${e.slug}")`);
      });
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkEntities();
