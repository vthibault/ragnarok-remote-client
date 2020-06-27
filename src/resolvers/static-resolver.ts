import {readFile} from 'fs';
import {resolve} from 'path';
import {TResolverGenerator} from '../../typings/TResolveGenerator';

export const staticResolver: TResolverGenerator = ({clientPath}) => (path) =>
  new Promise((end) => {
    const filePath = resolve(clientPath, path);

    readFile(filePath, (_, data) => {
      end(data ? {buffer: data} : null);
    });
  });
