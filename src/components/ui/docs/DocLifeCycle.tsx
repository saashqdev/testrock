import CheckIcon from "../icons/CheckIcon";
import XIcon from "../icons/XIcon";

interface Props {
  items: { route: string; c: boolean; r: boolean; u: boolean; d: boolean }[];
}

export default function DocLifeCycle({ items }: Props) {
  return (
    <div className="not-prose flex flex-col">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="shadow-xs overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-secondary">
                <tr>
                  <th scope="col" className="w-full px-2 py-1.5 text-left text-sm font-semibold text-foreground sm:pl-6">
                    Route
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-center text-sm font-semibold text-foreground">
                    Create
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-center text-sm font-semibold text-foreground">
                    Read
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-center text-sm font-semibold text-foreground">
                    Update
                  </th>
                  <th scope="col" className="px-2 py-1.5 text-center text-sm font-semibold text-foreground">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {items.map((item) => (
                  <tr key={item.route}>
                    <td className="whitespace-nowrap px-2 py-1.5 text-sm font-medium text-foreground sm:pl-6">{item.route}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center text-sm text-muted-foreground">
                      {item.c ? <CheckIcon className="mx-auto h-4 w-4 text-theme-500" /> : <XIcon className="mx-auto h-4 w-4 text-gray-300" />}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center text-sm text-muted-foreground">
                      {item.r ? <CheckIcon className="mx-auto h-4 w-4 text-theme-500" /> : <XIcon className="mx-auto h-4 w-4 text-gray-300" />}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center text-sm text-muted-foreground">
                      {item.u ? <CheckIcon className="mx-auto h-4 w-4 text-theme-500" /> : <XIcon className="mx-auto h-4 w-4 text-gray-300" />}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-center text-sm text-muted-foreground">
                      {item.d ? <CheckIcon className="mx-auto h-4 w-4 text-theme-500" /> : <XIcon className="mx-auto h-4 w-4 text-gray-300" />}
                    </td>
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
