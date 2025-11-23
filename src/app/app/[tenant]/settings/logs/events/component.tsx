"use client";

import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { EventWithAttemptsDto } from "@/db/models/events/EventsModel";
import EventsTable from "@/modules/events/components/EventsTable";

type LoaderData = {
  title: string;
  items: EventWithAttemptsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

interface EventsClientWrapperProps {
  data: LoaderData;
  params: any;
}

export default function EventsClientWrapper({ data, params }: EventsClientWrapperProps) {
  return <EventsTable items={data.items} pagination={data.pagination} />;
}
