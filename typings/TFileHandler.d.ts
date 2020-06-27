export interface TFileHandler {
  extensions: string[];
  handler: (
    data: Buffer
  ) => Promise<{
    buffer: Buffer;
    extension?: string;
  }>;
}
