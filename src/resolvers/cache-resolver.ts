import {readFile, stat} from 'fs';
import {resolve} from 'path';
import {promisify} from 'util';
import {TResolverGenerator} from '../../typings/TResolveGenerator';

const statP = promisify(stat);
const readFileP = promisify(readFile);

export const cacheResolver: TResolverGenerator = ({
  grfFiles,
  extract,
  extractPath
}) => {
  // Disable cache-resolver if extract config is not specified
  if (!extract) {
    return null;
  }

  // Get last grf update date
  const lastGrfUpdate = Math.max(
    0,
    ...grfFiles.map(({date}) => date.getTime())
  );

  // Function that try to load the file and check if the cache is more
  // recent than the grfs, if that's the cas, we invalidate the cache file
  const loadFile = async (filePath: string): Promise<Buffer | null> => {
    try {
      const {mtime} = await statP(filePath + '.png');
      if (mtime.getTime() > lastGrfUpdate) {
        return await readFileP(filePath);
      }
    } catch (error) {}

    return null;
  };

  return async (url) => {
    const filePath = resolve(extractPath, url);
    let buffer = null;

    // BMP files are converted to png or jpg files for
    // smaller download size
    if (/\/.bmp$/i.test(filePath)) {
      buffer =
        (await loadFile(filePath + '.png')) ||
        (await loadFile(filePath + '.jpg')) ||
        (await loadFile(filePath));
    }

    if (!buffer) {
      buffer = await loadFile(filePath);
    }

    return {
      buffer,
      fromCache: true
    };
  };
};
