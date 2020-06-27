import fs from 'fs';
import ini from 'ini';
import ora from 'ora';
import {promisify} from 'util';
import http from 'http';
import path from 'path';
import zlib from 'zlib';
import yargs from 'yargs';
import chalk from 'chalk';
import {GrfNode} from 'grf-loader';

import resolvers from './resolvers';
import fileHandlers from './file-handlers';
import {fileHeaders} from './static/file-headers';
import {fileCompress} from './static/file-compress';
import args from './static/args';
import type {TResolver} from '../typings/TResolver';
import type {TRemoteClientParams} from '../typings/TRemoteClientParams';

const open = promisify(fs.open);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const deflate = promisify(zlib.deflate);
const gzip = promisify(zlib.gzip);

export class RemoteClient {
  grfFiles: {
    grf: GrfNode;
    date: Date;
  }[];

  clientPath: string;
  extractPath: string;
  compress: boolean;
  extract: boolean;
  host: string;
  port: number;
  resolvers: TResolver[];

  constructor(options: TRemoteClientParams = {}) {
    let yargsConfig = yargs.config(options).help('help');

    Object.entries(args).forEach(([key, {defaultValue, description}]) => {
      yargsConfig = yargsConfig
        .describe(key, description)
        .default(key, defaultValue);
    });

    const argv = yargsConfig.argv as TRemoteClientParams;

    this.grfFiles = [];
    this.clientPath = argv.clientPath || argv['client-path'];
    this.extractPath = argv.extractPath || argv['extract-path'];
    this.compress = argv.compress;
    this.extract = argv.extract;
    this.host = argv.host;
    this.port = argv.port;
  }

  public async loadClient(): Promise<void> {
    console.log(`Initializing client ${chalk.cyan(this.clientPath)}`);

    const files = await readdir(this.clientPath);
    const dataIni = files.find((file) => file.toLowerCase() === 'data.ini');
    let grfs: string[] = [];

    const dataIniSpinner = ora({
      indent: 1,
      text: 'Loading data.ini file'
    }).start();

    if (dataIni) {
      const iniContent = await readFile(path.resolve(this.clientPath, dataIni));
      const iniConfig = ini.parse(iniContent.toString());
      const key = Object.keys(iniConfig).find(
        (data) => data.toLowerCase() === 'data'
      );

      grfs = Object.values(iniConfig[key]);
      dataIniSpinner.succeed(
        chalk.green(`data.ini file loaded with grfs: ${grfs.join()}!`)
      );
    } else {
      grfs = files.filter((file) => /\.grf$/i.test(file));
      dataIniSpinner.warn(
        chalk.yellow(
          `No data.ini files found, loading grfs without order can lead to errors ! ${grfs.join()}`
        )
      );
    }

    for (const filename of grfs) {
      const grfSpinner = ora({
        indent: 1,
        text: 'Loading GRF ' + filename
      }).start();

      const filePath = path.resolve(this.clientPath, filename);

      try {
        const fd = await open(filePath, 'r');
        const {mtime} = await stat(filePath);

        const grf = new GrfNode(fd);
        await grf.load();
        grfSpinner.succeed(chalk.green(`File ${filename} loaded!`));

        this.grfFiles.push({
          grf,
          date: mtime
        });
      } catch (error) {
        grfSpinner.fail(chalk.red(`Failed to load GRF ${filePath}`));
      }
    }

    this.resolvers = resolvers
      .map((resolver) => resolver(this))
      .filter(Boolean);
  }

  public start(): http.Server | null {
    if (!this.grfFiles.length) {
      console.error(chalk.red('Remote client should have files to load'));
      return null;
    }

    console.log(
      'Starting server',
      chalk.cyan(
        `http://${this.host}${this.port !== 80 ? `:${this.port}` : ''}`
      )
    );

    return http
      .createServer(async (req, res) => {
        const filePath = decodeURIComponent(
          req.url.substr(1).replace(/\?.*/, '')
        );
        let data = null;

        // Find file from resolvers
        for (const resolver of this.resolvers) {
          data = await resolver(filePath);
          if (data) {
            break;
          }
        }

        // 404 not found
        if (!data) {
          res.writeHead(404);
          res.end();
          return;
        }

        const matches = filePath.match(/\.(\w+)$/);
        let ext = (matches ? matches[1] : 'unknown').toLowerCase();
        let result = data.buffer;

        // Process files only if it's not inside the cache (it should already be
        // optimized and ready for dispatch)
        if (!data.fromCache) {
          let newExtension = '';

          // Optimize file format
          if (ext in fileHandlers) {
            const {buffer, extension} = await fileHandlers[ext](result);

            result = buffer;
            ext = extension || ext;
            newExtension = extension;
          }

          // Save file inside cache
          if (this.extract) {
            const newPath = `${filePath}${
              newExtension ? `.${newExtension}` : ''
            }`;
            fs.writeFile(
              path.resolve(this.extractPath, newPath),
              result,
              () => {}
            );
          }
        }

        // Apply headers
        const header = fileHeaders[ext] || 'application/octet-stream';
        res.setHeader('content-type', header);

        // Apply compression
        // Not optimized because we are working with buffers instead of streams
        // It's better to let the load balancer handle the compression part
        if (this.compress || (true && fileCompress[ext])) {
          const acceptEncoding = String(req.headers['accept-encoding']);

          if (/\bdeflate\b/.test(acceptEncoding)) {
            try {
              const buffer = await deflate(result);
              res.setHeader('content-encoding', 'deflate');
              res.end(buffer);
              return;
            } catch (error) {}
          }

          if (/\bgzip\b/.test(acceptEncoding)) {
            try {
              const buffer = await gzip(result);
              res.setHeader('content-encoding', 'gzip');
              res.end(buffer);
              return;
            } catch (error) {}
          }
        }

        res.end(result);
      })
      .listen(this.port);
  }
}
