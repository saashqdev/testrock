/**
 * Cleanup script to remove trailing closing braces left from namespace conversion
 */

import * as fs from "fs";
import * as path from "path";

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!item.startsWith(".") && item !== "node_modules" && item !== "dist") {
          results.push(...findFiles(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        if (extensions.some((ext) => item.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return results;
}

function cleanupFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Check if the last non-empty line is just a closing brace
  let lastIndex = lines.length - 1;
  while (lastIndex >= 0 && lines[lastIndex].trim() === "") {
    lastIndex--;
  }

  if (lastIndex >= 0 && lines[lastIndex].trim() === "}") {
    // Check if the second-to-last non-empty line also ends with }
    let secondLastIndex = lastIndex - 1;
    while (secondLastIndex >= 0 && lines[secondLastIndex].trim() === "") {
      secondLastIndex--;
    }

    if (secondLastIndex >= 0 && lines[secondLastIndex].trim().endsWith("}")) {
      // Remove the extra closing brace line
      lines.splice(lastIndex, 1);
      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
      return true;
    }
  }

  return false;
}

async function cleanup() {
  const workspaceRoot = process.cwd();
  const srcDir = path.join(workspaceRoot, "src");

  console.log("Cleaning up extra closing braces...\n");

  const files = findFiles(srcDir, [".ts", ".tsx"]);
  let fixedCount = 0;

  for (const file of files) {
    if (cleanupFile(file)) {
      console.log(`Fixed: ${path.relative(workspaceRoot, file)}`);
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} files`);
}

cleanup().catch(console.error);
