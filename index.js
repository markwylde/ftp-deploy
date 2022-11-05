#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import * as ftp from 'basic-ftp';

const ftpsync = async (config) => {
  for (const task of config.tasks) {
    const client = new ftp.Client();

    client.ftp.verbose = config.verbose;
    if (config.log !== undefined) {
      client.ftp.log = config.log;
    }

    try {
      await client.access({
        host: task.hostname,
        user: task.username,
        port: task.port,
        password: task.password,
        secure: true,
        secureOptions: {
          rejectUnauthorized: false
        }
      });

      const stat = await fs.lstat(task.source);
      if (stat.isDirectory()) {
        await client.ensureDir(task.destination);
        if (task.clearDestination) {
          await client.clearWorkingDir();
        }

        await client.uploadFromDir(task.source);
      } else {
        const destinationDirectory = path.dirname(task.destination);
        const destinationFile = path.basename(task.destination);
        await client.ensureDir(destinationDirectory);
        if (task.clearDestination) {
          await client.clearWorkingDir();
        }

        await client.uploadFrom(task.source, destinationFile);
      }
    } finally {
      client.close();
    }
  }
};

export default ftpsync;

const nodePath = path.resolve(process.argv[1]);
const modulePath = path.resolve(fileURLToPath(import.meta.url));
const isRunningDirectlyViaCLI = nodePath === modulePath;
if (isRunningDirectlyViaCLI) {
  (async function () {
    const configFile = path.join(process.cwd(), process.argv[2]);
    if (!configFile) {
      throw new Error('You must specify a config file');
    }
    const data = (await import(configFile)).default;
    ftpsync(data);
  })();
}
