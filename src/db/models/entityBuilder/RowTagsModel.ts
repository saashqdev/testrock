import { RowTag, EntityTag } from "@prisma/client";

export type RowTagsModel = {
  name: string;
  color: string;
};

export type RowTagWithDetailsDto = RowTag & {
  tag: EntityTag;
};
