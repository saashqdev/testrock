import Link from "next/link";
import UnderConstruction from "@/components/ui/misc/UnderConstruction";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type LoaderData = {};
export const loader = async (props: IServerComponentsProps) => {
  const data: LoaderData = {};
  return data;
};

type CreateTemplateType = {
  title: string;
  description: string;
  href: string;
  enterprise?: boolean;
  underConstruction?: boolean;
};

const types: CreateTemplateType[] = [
  {
    title: "Manual",
    description: "Upload a JSON configuration",
    href: "templates/manual",
  },
];

export default function AdminEntityNoCodeRoute() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-b md:border-border md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-foreground">Entity Templates</h3>
          {/* <div className="flex items-center space-x-2">
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div> */}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {types.map((item) => {
          return (
            <Link
              key={item.title}
              href={item.href}
              className="focus:outline-hidden relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-border p-3 text-center hover:border-border focus:border-2 focus:border-gray-600 focus:bg-background"
            >
              <div className="block text-sm font-medium text-foreground">
                {item.title} {item.enterprise && <span className="text-xs font-extrabold">(Pro 🚀)</span>}
              </div>
              <div className="block text-xs text-muted-foreground">{item.description}</div>
              {item.underConstruction && <div className="text-xs text-muted-foreground">Under 🚧 Construction</div>}
            </Link>
          );
        })}
      </div>
      {/* <UnderConstruction
        title="TODO: ENTITY TEMPLATES"
        description="Default entities with properties, relationships, views, webhooks... I'm thinking of letting NextRock users share their functional templates (long-term), no-code and downloadable custom-code."
      /> */}
    </div>
  );
}
