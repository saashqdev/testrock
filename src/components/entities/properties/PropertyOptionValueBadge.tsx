import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import RowSelectedOptionCell from "../rows/cells/RowSelectedOptionCell";
import { SelectOptionsDisplay } from "@/lib/shared/SelectOptionsUtils";

interface Props {
  entity: EntityWithDetailsDto;
  property: string;
  value: string;
  display: SelectOptionsDisplay;
}
export default function PropertyOptionValueBadge({ entity, property, value, display }: Props) {
  return <RowSelectedOptionCell value={value} options={entity.properties.find((f) => f.name === property)?.options ?? []} display={display} />;
}
