import os from 'os';
import cluster from 'cluster';
import type {Server} from 'http';
import {RemoteClient} from './remote-client';

export {RemoteClient};

(async () => {
  // Can't use the recommended way: require.main === module;
  // It's not working when running from webpack dev mode
  const isCLI = !module.parent;

  // Just export RemoteClient
  if (!isCLI) {
    console.log('not cli');
    return;
  }

  // Start master using cpus
  if (cluster.isMaster) {
    console.log('master');
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(
        `worker ${worker.process.pid} died with signal ${signal} and code ${code}`
      );
    });

    return;
  }

  console.log(`Worker ${process.pid} started`);
  const remoteClient = new RemoteClient();
  await remoteClient.loadClient();

  remoteClient.start();

  if (module.hot) {
    console.log('✅  Server-side HMR Enabled!');
    module.hot.accept();
  }
})();
