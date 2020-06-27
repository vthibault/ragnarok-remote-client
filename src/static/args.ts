export default {
  host: {
    defaultValue: '127.0.0.1',
    description: 'Server host to open'
  },
  port: {
    defaultValue: 3000,
    description: 'Server port to open'
  },
  'client-path': {
    defaultValue: './client',
    description: 'Location of the Ragnarok Game client'
  },
  extract: {
    defaultValue: false,
    description: 'Save file after GRF extraction/optimization?'
  },
  'extract-path': {
    defaultValue: './client/cache',
    description:
      'Location of the folder where we extract files (only if extract=true)'
  },
  'http-compress': {
    defaultValue: false,
    description:
      'Should we HTTP compress the result ? (better to use a load balancer)'
  }
};
