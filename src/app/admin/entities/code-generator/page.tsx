import Link from "next/link";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

type LoaderData = {
  entities: EntityWithDetailsDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const data: LoaderData = {
    entities: await db.entities.getAllEntities(null),
  };
  return data;
}

export default async function CodeGeneratorPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const { t } = await getServerTranslations();
  return (
    <div className="space-y-4 overflow-y-auto p-4 sm:px-8 sm:py-7">
      {data.entities.length === 0 ? (
        <Link
          href="/admin/entities/new"
          className="border-border focus:bg-background hover:border-border relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed p-6 text-center focus:border-2 focus:border-gray-600 focus:outline-hidden"
        >
          <div className="text-foreground block text-sm font-medium">Create entity</div>
        </Link>
      ) : (
        <>
          <div className="text-foreground text-lg font-bold">{t("shared.generate")}</div>
          <div className="grid grid-cols-3 gap-3">
            {data.entities.map((item) => {
              return (
                <Link
                  key={item.name}
                  href={`files/${item.name}`}
                  className="border-border focus:bg-background hover:border-border relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed p-3 text-center focus:border-2 focus:border-gray-600 focus:outline-hidden"
                >
                  <div className="text-foreground block text-sm font-medium">{t(item.titlePlural)}</div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
