export interface IBlacklistDb {
  getBlacklist(filters?: any, pagination?: { page: number; pageSize: number }): Promise<{ items: any[]; pagination: any }>;
  findInBlacklist(type: string, value: string): Promise<any | null>;
  addBlacklistAttempt(item: any): Promise<any>;
  addToBlacklist(data: { type: string; value: string }): Promise<any>;
  deleteFromBlacklist(where: { type: string; value: string }): Promise<any>;
}
