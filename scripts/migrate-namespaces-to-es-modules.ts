/**
 * Migration script to convert TypeScript namespaces to ES modules
 * Converts patterns like:
 *   export namespace Foo {
 *     export type LoaderData = { ... };
 *     export const loader = async () => { ... };
 *   }
 *
 * To:
 *   export type LoaderData = { ... };
 *   export const loader = async () => { ... };
 *
 * Also updates all import statements from:
 *   import { Foo } from "./Foo";
 *   data: Foo.LoaderData
 *   await Foo.loader(props)
 *
 * To:
 *   import { LoaderData, loader } from "./Foo";
 *   data: LoaderData
 *   await loader(props)
 *
 * Usage: npx tsx scripts/migrate-namespaces-to-es-modules.ts
 */

import * as fs from "fs";
import * as path from "path";

interface NamespaceInfo {
  name: string;
  exports: string[];
}

/**
 * Recursively find all files matching extensions
 */
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

/**
 * Extract namespace name and its exports from a file
 */
function extractNamespaceInfo(content: string): NamespaceInfo | null {
  const namespaceMatch = content.match(/export namespace (\w+) \{/);
  if (!namespaceMatch) return null;

  const namespaceName = namespaceMatch[1];
  const exports: string[] = [];

  // Match all export statements within the namespace
  const exportMatches = content.matchAll(/^\s+export (type|const|async function|function|class|interface|enum) (\w+)/gm);
  for (const match of exportMatches) {
    exports.push(match[2]);
  }

  return { name: namespaceName, exports };
}

/**
 * Convert namespace pattern to ES module exports
 */
function convertNamespaceToESModule(content: string, info: NamespaceInfo): string {
  // Find the namespace declaration and its closing brace
  const namespacePattern = new RegExp(`export namespace ${info.name} \\{([\\s\\S]*?)^\\}$`, "gm");

  const match = namespacePattern.exec(content);
  if (!match) {
    console.warn(`  Could not find namespace pattern for ${info.name}`);
    return content;
  }

  // Extract the content between namespace braces
  let namespaceContent = match[1];

  // Remove one level of indentation (2 spaces) from each line
  namespaceContent = namespaceContent.replace(/^  /gm, "");

  // Replace the entire namespace block with just the content
  const result = content.replace(namespacePattern, namespaceContent.trimStart());

  return result;
}

/**
 * Update imports in consumer files
 */
function updateConsumerImports(content: string, namespaceName: string, exports: string[]): string {
  let result = content;

  // Pattern 1: import { Namespace } from "path"
  const importRegex = new RegExp(`import \\{\\s*${namespaceName}\\s*\\}\\s*from\\s*["']([^"']+)["'];?`, "g");

  result = result.replace(importRegex, (match, importPath) => {
    // If this file defines types/values from the namespace, import them
    const usedExports = exports.filter((exp) => {
      const usagePattern = new RegExp(`${namespaceName}\\.${exp}\\b`, "g");
      return usagePattern.test(content);
    });

    if (usedExports.length > 0) {
      return `import { ${usedExports.join(", ")} } from "${importPath}";`;
    }
    return match;
  });

  // Pattern 2: Replace Namespace.Export usages
  for (const exp of exports) {
    const usageRegex = new RegExp(`${namespaceName}\\.${exp}\\b`, "g");
    result = result.replace(usageRegex, exp);
  }

  return result;
}

/**
 * Process a single file that defines a namespace
 */
function processNamespaceFile(filePath: string): NamespaceInfo | null {
  const content = fs.readFileSync(filePath, "utf-8");
  const info = extractNamespaceInfo(content);

  if (!info) {
    return null;
  }

  console.log(`Converting namespace in ${filePath}: ${info.name}`);
  console.log(`  Exports: ${info.exports.join(", ")}`);

  const converted = convertNamespaceToESModule(content, info);
  fs.writeFileSync(filePath, converted, "utf-8");

  return info;
}

/**
 * Process consumer files that import a namespace
 */
function processConsumerFiles(namespaceName: string, exports: string[], workspaceRoot: string) {
  const srcDir = path.join(workspaceRoot, "src");
  const files = findFiles(srcDir, [".ts", ".tsx"]);

  let updatedCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");

    // Check if this file imports the namespace
    if (content.includes(`import { ${namespaceName} }`)) {
      console.log(`  Updating consumer: ${path.relative(workspaceRoot, file)}`);
      const updated = updateConsumerImports(content, namespaceName, exports);

      if (updated !== content) {
        fs.writeFileSync(file, updated, "utf-8");
        updatedCount++;
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`  Updated ${updatedCount} consumer files`);
  }
}

/**
 * Main migration function
 */
async function migrateNamespaces() {
  const workspaceRoot = path.resolve(process.cwd());
  console.log(`Workspace root: ${workspaceRoot}\n`);

  // Find all files with "export namespace"
  const srcDir = path.join(workspaceRoot, "src");
  const files = findFiles(srcDir, [".ts", ".tsx"]);

  const namespacesInfo: Array<{ name: string; exports: string[]; file: string }> = [];

  // First pass: Convert all namespace files and collect info
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes("export namespace")) {
      const info = processNamespaceFile(file);
      if (info) {
        namespacesInfo.push({ ...info, file });
      }
    }
  }

  console.log(`\nConverted ${namespacesInfo.length} namespace files\n`);

  // Second pass: Update all consumer files
  for (const { name, exports } of namespacesInfo) {
    console.log(`Updating consumers of namespace: ${name}`);
    processConsumerFiles(name, exports, workspaceRoot);
  }

  console.log("\nMigration complete!");
  console.log("Please run 'pnpm typecheck' to verify the changes.");
}

// Run migration
migrateNamespaces().catch(console.error);
