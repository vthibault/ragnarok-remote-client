export type TResolver = (
  data: string
) => Promise<null | {
  buffer: Buffer;
  fromCache?: boolean;
}>;
