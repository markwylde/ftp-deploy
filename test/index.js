import { strict as assert } from 'assert';
import { promises as fs } from 'fs';
import deploy from '../index.js';
import { globby } from 'globby';
import { spawn } from 'child_process';
import { test } from 'node:test';

const ftpAccess = {
  hostname: 'localhost',
  port: 2121,
  username: 'test',
  password: 'test'
};

const wipe = async () => {
  await fs.rm('/tmp/test', { recursive: true, force: true });
  await fs.mkdir('/tmp/test', { recursive: true, force: true });
};

const serverChildProcess = spawn('ftpserver', { cwd: 'test/helpers', stdio: 'inherit' });

await new Promise(resolve => setTimeout(resolve, 500));

test('sync folder to root works', async () => {
  await wipe();

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works',
      destination: ''
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);
});

test('sync folder to subdirectory works', async () => {
  await wipe();

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works',
      destination: 'sub'
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/sub/a.txt',
    '/tmp/test/sub/b/c.txt'
  ]);
});

test('sync sub directory to root works', async () => {
  await wipe();

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works/b',
      destination: ''
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/c.txt'
  ]);
});

test('sync single file to root works', async () => {
  await wipe();

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works/a.txt',
      destination: 'a.txt'
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/a.txt'
  ]);
});

test('sync single file to subdirectory works', async () => {
  await wipe();

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works/a.txt',
      destination: 'b/a.txt'
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/b/a.txt'
  ]);
});

test('sync folder without log', async () => {
  await wipe();

  const logData = [];
  const log = (...entries) => logData.push(...entries);

  const config = {
    log,
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works',
      destination: ''
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);

  assert.ok(logData.length > 0, 'had at least 1 log entry');
});

test('sync folder with log', async () => {
  await wipe();

  const logData = [];
  const log = (...entries) => logData.push(...entries);

  const config = {
    verbose: true,
    log,
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works',
      destination: ''
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);

  assert.ok(logData.length > 0, 'had at least 1 log entry');
});

test('sync folder to root works wiping without clear existing files', async () => {
  await wipe();
  await fs.writeFile('/tmp/test/d.txt', 'this is d.txt');

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works',
      destination: ''
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/d.txt',
    '/tmp/test/b/c.txt'
  ]);
});

test('sync folder to root works wiping with clear existing files', async () => {
  await wipe();
  await fs.writeFile('/tmp/test/d.txt', 'this is d.txt');

  const config = {
    tasks: [{
      ...ftpAccess,
      source: './test/tests/sync-folder-works',
      destination: '',
      clearDestination: true
    }]
  };

  await deploy(config);

  const files = await globby('/tmp/test');

  assert.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);
});

test.after(() => {
  serverChildProcess.kill('SIGKILL');
});
