"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import EntitiesTable from "@/components/entities/EntitiesTable";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputSearch from "@/components/ui/input/InputSearch";
import { useAdminData } from "@/lib/state/useAdminData";
import { EntityWithCountDto } from "@/db/models/entityBuilder/EntitiesModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import DateUtils from "@/lib/shared/DateUtils";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import DownloadIcon from "@/components/ui/icons/DownloadIcon";
import EntityHelper from "@/lib/helpers/EntityHelper";

type LoaderData = {
  title: string;
  items: EntityWithCountDto[];
  relationships: EntityRelationshipWithDetailsDto[];
};

export default function EntitiesIndexClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const adminData = useAdminData();

  const [selected, setSelected] = useState<EntityWithCountDto[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!data.items) {
      return [];
    }
    return data.items.filter(
      (f) =>
        DateUtils.dateYMDHMS(f.createdAt)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.slug?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.title?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.titlePlural?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        t(f.title)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        t(f.titlePlural)?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.properties.find(
          (x) =>
            x.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.title?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            t(x.title)?.toString().toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  function exportEntities() {
    let items = selected.length > 0 ? selected : filteredItems();
    const templateEntities = EntityHelper.exportEntitiesToTemplate(items, data.relationships);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateEntities, null, "\t"));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "entities.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-border md:border-b md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">{t("models.entity.plural")}</h3>
          <div className="flex items-center space-x-2">
            <InputSearch className="hidden sm:block" value={searchInput} onChange={setSearchInput} />
            <ButtonSecondary disabled={data.items.length === 0} onClick={exportEntities} className="text-muted-foreground">
              <DownloadIcon className="h-5 w-5" />
            </ButtonSecondary>
            <ButtonPrimary disabled={!getUserHasPermission(adminData, "admin.entities.create")} to="/admin/entities/new">
              <span>{t("shared.new")}</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>

      <EntitiesTable items={filteredItems()} selected={selected} onSelected={(e) => setSelected(e)} />

      {/* <div className="mt-2">
        <h3 className="text-lg font-medium leading-6 text-foreground">{t("models.relationship.plural")}</h3>
        <EntityRelationshipsTable items={data.relationships} editable={false} />
      </div> */}
    </div>
  );
}
