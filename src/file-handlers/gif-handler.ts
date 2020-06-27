import Jimp from 'jimp';
import type {TFileHandler} from '../../typings/TFileHandler';

export const GifHandler: TFileHandler = {
  extensions: ['gif'],
  handler: async (data) => {
    const image = await Jimp.read(data);
    const buffer = await image.getBufferAsync(Jimp.MIME_GIF);

    return {buffer};
  }
};
