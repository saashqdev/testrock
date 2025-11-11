export interface ITenantInboundAddressesDb {
  getTenantInboundAddress(addresses: string[]): Promise<
    {
      id: string;
      tenantId: string;
      address: string;
    }[]
  >;
  getTenantInboundAddressById(id: string): Promise<{
    id: string;
    tenantId: string;
    address: string;
  } | null>;
}
