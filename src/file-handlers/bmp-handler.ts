import Jimp from 'jimp';
import type {TFileHandler} from '../../typings/TFileHandler';

export const BmpHandler: TFileHandler = {
  extensions: ['bmp'],
  handler: async (data) => {
    const image = await Jimp.read(data);
    const pixels = image.bitmap.data;
    const count = pixels.length;

    let hasAlpha = false;

    // Remove magenta and replace it with transparent color
    for (let i = 0; i < count; i += 4) {
      if (pixels[i + 0] > 250 && pixels[i + 1] < 5 && pixels[i + 2] > 250) {
        pixels[i + 0] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
        hasAlpha = true;
      }
    }

    const mime = hasAlpha ? Jimp.MIME_PNG : Jimp.MIME_JPEG;
    const buffer = await image.getBufferAsync(mime);

    return {
      buffer,
      extension: hasAlpha ? 'png' : 'jpg'
    };
  }
};
