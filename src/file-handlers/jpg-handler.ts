import Jimp from 'jimp';
import type {TFileHandler} from '../../typings/TFileHandler';

export const JpgHandler: TFileHandler = {
  extensions: ['jpg', 'jpeg'],
  handler: async (data) => {
    const image = await Jimp.read(data);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    return {buffer};
  }
};
