import createTestSuite from 'just-tap';
import { promises as fs } from 'fs';
import deploy from '../index.js';
import { globby } from 'globby';
import { spawn } from 'child_process';

const ftpAccess = {
  hostname: 'localhost',
  port: 2121,
  username: 'test',
  password: 'test'
};

const wipe = async () => {
  await fs.rm('/tmp/test', { recursive: true, force: true });
  await fs.mkdir('/tmp/test');
};

const serverChildProcess = spawn('ftpserver', { cwd: 'test/helpers' });
const logs = [];
serverChildProcess.stdout.on('data', buffer => logs.push(buffer.toString()));
serverChildProcess.stderr.on('data', buffer => logs.push(buffer.toString()));
serverChildProcess.on('close', () => {
  console.log('\n---------------------');
  console.log('ftpserver log output:');
  console.log('---------------------');
  logs.forEach(i => console.log(i));
});

const { test, run } = createTestSuite({ concurrency: 1 });

test('sync folder to root works', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);
});

test('sync folder to subdirectory works', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/sub/a.txt',
    '/tmp/test/sub/b/c.txt'
  ]);
});

test('sync sub directory to root works', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/c.txt'
  ]);
});

test('sync single file to root works', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/a.txt'
  ]);
});

test('sync single file to subdirectory works', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/b/a.txt'
  ]);
});

test('sync folder without log', async t => {
  t.plan(2);

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

  t.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);

  t.ok(logData.length > 0, 'had at least 1 log entry');
});

test('sync folder with log', async t => {
  t.plan(2);

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

  t.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);

  t.ok(logData.length > 0, 'had at least 1 log entry');
});

test('sync folder to root works wiping without clear existing files', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/d.txt',
    '/tmp/test/b/c.txt'
  ]);
});

test('sync folder to root works wiping with clear existing files', async t => {
  t.plan(1);

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

  t.deepEqual(files, [
    '/tmp/test/a.txt',
    '/tmp/test/b/c.txt'
  ]);
});

await run();
serverChildProcess.kill();
