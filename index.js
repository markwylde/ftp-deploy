#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url'
import * as ftp from 'basic-ftp';

const ftpsync = async (config) => {
  for (const task of config) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
      await client.access({
          host: task.hostname,
          user: task.username,
          password: task.password,
          secure: true
      });
      await client.ensureDir(task.destination);
      await client.clearWorkingDir();
      await client.uploadFromDir(task.source, task.destination);
    } finally {
      client.close()  
    } 
  }
}

export default ftpsync;

const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url))
const isRunningDirectlyViaCLI = nodePath === modulePath
if (isRunningDirectlyViaCLI) {
  (async function() {
    const configFile = process.argv[2];
    if (!configFile) {
      throw new Error('You must specify a config file');
    }
    const data = (await import(configFile)).default;
    ftpsync(data);
  })();
}
