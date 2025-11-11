export interface IEmailAttachmentsDb {
  updateEmailAttachmentFileProvider(
    id: string,
    data: {
      content?: string;
      publicUrl?: string | null;
      storageBucket?: string | null;
      storageProvider?: string | null;
    }
  ): Promise<void>;
}
