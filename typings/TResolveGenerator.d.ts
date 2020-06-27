import type {RemoteClient} from '../src/remote-client';
import type {TResolver} from './TResolver';

export type TResolverGenerator = (
  remoteClient: RemoteClient
) => TResolver | null;
