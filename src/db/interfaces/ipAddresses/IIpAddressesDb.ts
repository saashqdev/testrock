import { Prisma } from "@prisma/client";
import { PaginationDto } from "@/lib/dtos/PaginationDto";

export interface IIpAddressesDb {
  getAllIpAddresses(
    pagination?:
      | {
          page: number;
          pageSize: number;
        }
      | undefined
  ): Promise<{
    items: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      ip: string;
      metadata: string;
      provider: string;
      type: string;
      countryCode: string;
      countryName: string;
      regionCode: string;
      regionName: string;
      city: string;
      zipCode: string;
      latitude: Prisma.Decimal | null;
      longitude: Prisma.Decimal | null;
    }[];
    pagination: PaginationDto;
  }>;
}
