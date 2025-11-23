"use client";

import Link from "next/link";
import TableSimple from "@/components/ui/tables/TableSimple";

type CrudExample = {
  title: string;
  files: {
    id: string;
    type: "Route" | "Service" | "DTO" | "Component";
    name: string;
    path: string;
    description: string;
    href?: string;
  }[];
};

interface Props {
  examples: CrudExample[];
}

export default function CrudExamplesTable({ examples }: Props) {
  return (
    <>
      {examples.map((example, idx) => {
        return (
          <div key={idx} className="space-y-2">
            <h2 className="font-medium text-foreground">{example.title}</h2>
            <TableSimple
              items={example.files}
              headers={[
                {
                  name: "type",
                  title: "Type",
                  value: (item) => item.type,
                },
                {
                  name: "name",
                  title: "Name",
                  value: (item) => (
                    <div>
                      {item.href ? (
                        <Link className="font-medium underline" href={item.href}>
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </div>
                  ),
                },
                {
                  name: "description",
                  title: "Description",
                  value: (item) => item.description,
                },
                {
                  name: "path",
                  title: "Path",
                  value: (item) => (
                    <div className="prose">
                      <code className="select-all">{item.path}</code>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      })}
    </>
  );
}
