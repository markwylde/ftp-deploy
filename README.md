# simple ftp deploy
Deploy a folder to an ftp server.

## Installation
```
npm install simple-ftp-deploy
```

## Usage
### Via command line
```
simple-ftp-deploy deployConfig.js
```

### Via API
```javascript
import deploy from 'simple-ftp-deploy';

const config = [{
  hostname: process.env.WEBSITE1_FTP_HOSTNAME,
  username: process.env.WEBSITE1_FTP_USERNAME,
  password: process.env.WEBSITE1_FTP_PASSWORD,
  source: './dist/website1',
  destination: ''
}, {
  hostname: process.env.WEBSITE2_FTP_HOSTNAME,
  username: process.env.WEBSITE2_FTP_USERNAME,
  password: process.env.WEBSITE2_FTP_PASSWORD,
  source: './dist/website2',
  destination: ''
}];

deploy(config);
```
