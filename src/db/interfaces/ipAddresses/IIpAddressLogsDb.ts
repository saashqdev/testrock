import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { IpAddressLogWithDetailsDto } from "@/db/models/ipAddresses/IpAddressLogsModel";

export interface IIpAddressLogsDb {
  getAllIpAddressLogs(pagination?: { page: number; pageSize: number }): Promise<{ items: IpAddressLogWithDetailsDto[]; pagination: PaginationDto }>;
}
