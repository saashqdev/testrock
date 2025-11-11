"use client";

import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import LogsTable from "@/components/app/events/LogsTable";

type LoaderData = {
  items: LogWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

interface EventsClientProps {
  data: LoaderData;
  params: { tenant?: string };
}

export default function EventsClient({ data, params }: EventsClientProps) {
  return <LogsTable items={data.items} withTenant={false} pagination={data.pagination} />;
}
