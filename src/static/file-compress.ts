interface TFileCompress {
  [extension: string]: boolean;
}

export const fileCompress: TFileCompress = {
  act: true,
  ase: false,
  bmp: true,
  ezv: true,
  flc: false,
  fna: false,
  gat: true,
  gnd: true,
  gr2: false,
  imf: true,
  lua: true,
  lub: false,
  mp3: false,
  pal: true,
  rsm: true,
  rsw: true,
  rsx: false,
  scc: false,
  scp: false,
  sfk: false,
  spr: true,
  str: true,
  txt: true,
  wav: false,
  xml: true
};
