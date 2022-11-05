# simple ftp deploy
Deploy a folder to an ftp server.

## Installation
```
npm install @markwylde/ftp-deploy
```

## Usage
### Via command line
```
simple-ftp-deploy deployConfig.js
```

### Via API
```javascript
import deploy from '@markwylde/ftp-deploy';

const config = {
  // optional: default is false
  verbose: true,

  // optional: logger if verbose is true
  log: console.log,

  // list of syncs to make
  tasks: [
    {
      hostname: process.env.WEBSITE1_FTP_HOSTNAME,

      // optional
      port: 22,
      username: process.env.WEBSITE1_FTP_USERNAME,
      password: process.env.WEBSITE1_FTP_PASSWORD,

      // can be folder or file
      source: './dist/website1',

      // must be folder (if source is folder) or (file is source if file)
      destination: '',

      // optional: wipe everything in the destination folder
      clearDestination: true,
    }
  ]
};

deploy(config);
```
