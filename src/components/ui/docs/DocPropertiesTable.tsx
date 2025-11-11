import Link from "next/link";

interface Props {
  items: { name: string; title: string; type?: ModelPropertyType; customType?: { name: string; route?: string }; description?: string; required: boolean }[];
}
export enum ModelPropertyType {
  String,
  DateTime,
  Int,
  Decimal,
  Boolean,
  UUID,
  Cuid,
}

export default function DocPropertiesTable({ items }: Props) {
  return (
    <div className="not-prose flex flex-col">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="shadow-xs overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-secondary">
                <tr>
                  <th scope="col" className="px-2 py-1.5 text-left text-sm font-semibold text-foreground sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-sm font-semibold text-foreground">
                    Title
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-left text-sm font-semibold text-foreground">
                    Type
                  </th>
                  <th scope="col" className="w-full px-2 py-1.5 text-left text-sm font-semibold text-foreground">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {items.map((item) => (
                  <tr key={item.name}>
                    <td className="whitespace-nowrap px-2 py-1.5 text-sm font-medium text-foreground sm:pl-6">
                      {item.name} {item.required && <span className="ml-1 text-red-500">*</span>}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-sm text-muted-foreground">{item.title}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-sm text-muted-foreground">
                      {item.customType && (
                        <span className="font-bold">
                          {item.customType.route ? (
                            <Link className="text-theme-600 underline" href={item.customType.route}>
                              {item.customType.name}
                            </Link>
                          ) : (
                            item.customType.name
                          )}
                        </span>
                      )}
                      {item.type !== undefined && ModelPropertyType[item.type]}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-sm text-muted-foreground">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
