interface TFileHeaders {
  [extension: string]: string;
}

export const fileHeaders: TFileHeaders = {
  bmp: 'image/bmp',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  mp3: 'audio/mp3',
  png: 'image/png',
  txt: 'text/plain',
  xml: 'application/xml',
  wav: 'audio/wav'
};
