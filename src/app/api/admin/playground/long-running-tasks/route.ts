import { NextRequest, NextResponse } from "next/server";

const TOTAL_ITEMS = 100;
const MILLISECONDS_PER_ITEM = 300;
const BLOCK_SIZE = 10;

type ItemToImportDto = {
  id?: string;
  name: string;
  processed: boolean;
};

type NextActionDto = {
  action: string;
  from?: number;
  to?: number;
  total?: number;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "import") {
      const from = Number(formData.get("from"));
      const to = Number(formData.get("to"));
      const total = Number(formData.get("total"));

      // TODO - START: Simulate long-running task
      let items: ItemToImportDto[] = formData.getAll("items[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
      const itemsToImport = items.slice(from, to);
      await Promise.all(
        itemsToImport.map(async (item) => {
          item.id = Math.random().toString(36).substring(7);
          return await new Promise((resolve) => setTimeout(resolve, MILLISECONDS_PER_ITEM));
        })
      );
      items = items.slice(0, from).concat(itemsToImport).concat(items.slice(to));
      // TODO - END: Simulate long-running task

      const next: NextActionDto = {
        action: "import",
        from,
        to,
        total,
      };
      if (from + BLOCK_SIZE < total) {
        next.from = from + BLOCK_SIZE;
        next.to = to + BLOCK_SIZE;
        if (next.to > total) {
          next.to = total;
        }
        // optionally return all the items, including the "imported" ones
      } else {
        next.action = "process";
      }
      return NextResponse.json({ next, items });
    } else if (action === "process") {
      const items: ItemToImportDto[] = formData.getAll("items[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
      await Promise.all(
        items.map(async (item) => {
          item.processed = true;
          return await new Promise((resolve) => setTimeout(resolve, MILLISECONDS_PER_ITEM));
        })
      );
      return NextResponse.json({ success: "Imported and processed successfully", items });
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Error processing long-running task:", error);
    return NextResponse.json({ error: "An error occurred while processing the request" }, { status: 500 });
  }
}
