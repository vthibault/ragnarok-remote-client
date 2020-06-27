import {TResolverGenerator} from '../../typings/TResolveGenerator';

export const grfsResolver: TResolverGenerator = ({grfFiles}) => {
  const grfs = grfFiles.map(({grf}) => grf);

  return async (path) => {
    const filename = path.toLowerCase().replace(/\//g, '\\');

    for (const grf of grfs) {
      if (grf.files.has(filename)) {
        const {data} = await grf.getFile(filename);
        if (data) {
          return {
            buffer: Buffer.from(data)
          };
        }
      }
    }

    return Promise.resolve(null);
  };
};
