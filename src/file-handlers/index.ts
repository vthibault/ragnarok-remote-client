import {BmpHandler} from './bmp-handler';
import {GifHandler} from './gif-handler';
import {JpgHandler} from './jpg-handler';
import type {TFileHandler} from '../../typings/TFileHandler';

const fileHandlers: {
  [key: string]: TFileHandler['handler'];
} = {};

export default [BmpHandler, GifHandler, JpgHandler].reduce(
  (config, {extensions, handler}) => {
    extensions.forEach((ext) => {
      config[ext] = handler;
    });

    return config;
  },
  fileHandlers
);
